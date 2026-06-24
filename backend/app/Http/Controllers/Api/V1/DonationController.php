<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListDonationManagementRequest;
use App\Http\Requests\StoreDonationRequest;
use App\Http\Resources\DonationManagementResource;
use App\Http\Resources\DonationResource;
use App\Models\Donation;
use App\Models\DonationDocument;
use App\Services\DonationDocumentService;
use App\Services\FundingTransactionService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelPdf\Facades\Pdf;

class DonationController extends Controller
{
    public function index(ListDonationManagementRequest $request)
    {
        $filters = $request->validated();
        $query = $this->managementQuery($filters);
        $summary = $this->summaryFor($this->filteredDonationQuery($filters));
        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';

        $donations = $query
            ->orderBy($sort, $direction)
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return DonationManagementResource::collection($donations)
            ->additional([
                'summary' => $summary,
                'filters' => array_filter($filters, fn ($value) => $value !== null && $value !== ''),
            ]);
    }

    public function store(StoreDonationRequest $request, FundingTransactionService $funding)
    {
        return DonationResource::make($funding->createDonation($request->validated()));
    }

    public function show(Donation $donation, DonationDocumentService $documents)
    {
        $documents->ensureIssuedDocuments($donation, app()->getLocale());

        $donation->load([
            'donor',
            'fund',
            'allocations.educationalNeed.beneficiary',
            'documents',
            'paymentIntents.provider',
            'paymentTransactions.provider',
        ]);

        return DonationManagementResource::make($donation);
    }

    public function update(StoreDonationRequest $request, Donation $donation)
    {
        DB::transaction(fn () => $donation->update($request->validated()));

        return DonationResource::make($donation);
    }

    public function destroy(Donation $donation)
    {
        DB::transaction(fn () => $donation->delete());

        return response()->noContent();
    }

    public function downloadDocument(Donation $donation, DonationDocument $document, DonationDocumentService $documents)
    {
        abort_unless($document->donation_id === $donation->id, 404);
        abort_unless(($donation->status->value ?? $donation->status) === 'confirmed', 404);
        abort_unless($document->status === 'issued', 404);

        $documents->ensureIssuedDocuments($donation, $document->locale);
        $document->refresh();

        return Pdf::view('pdf.donation_document', [
            'donation' => $donation->loadMissing(['donor', 'fund']),
            'document' => $document,
        ])
            ->format('A4')
            ->margins(8, 8, 8, 8)
            ->name($document->document_number.'.pdf');
    }

    private function managementQuery(array $filters)
    {
        return $this->filteredDonationQuery($filters)
            ->with([
                'donor:id,uuid,name,email,type,status',
                'fund:id,uuid,code,name,currency,status',
                'paymentIntents.provider:id,key,name',
                'paymentTransactions.provider:id,key,name',
            ])
            ->withCount(['allocations', 'paymentIntents', 'paymentTransactions', 'documents'])
            ->withSum('allocations as allocated_amount', 'amount');
    }

    private function filteredDonationQuery(array $filters)
    {
        return Donation::query()
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $search = trim($search);

                $query->where(function ($query) use ($search): void {
                    $query->where('reference_number', 'like', "%{$search}%")
                        ->orWhere('provider_reference', 'like', "%{$search}%")
                        ->orWhereHas('donor', fn ($donorQuery) => $donorQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"));
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['provider'] ?? null, fn ($query, string $provider) => $query->where('provider', $provider))
            ->when($filters['method'] ?? null, fn ($query, string $method) => $query->where('method', $method))
            ->when($filters['currency'] ?? null, fn ($query, string $currency) => $query->where('currency', strtoupper($currency)))
            ->when($filters['fund_id'] ?? null, fn ($query, int $fundId) => $query->where('fund_id', $fundId))
            ->when($filters['donor_id'] ?? null, fn ($query, int $donorId) => $query->where('donor_id', $donorId))
            ->when($filters['donated_from'] ?? null, fn ($query, string $date) => $query->where('donated_at', '>=', Carbon::parse($date)->startOfDay()))
            ->when($filters['donated_to'] ?? null, fn ($query, string $date) => $query->where('donated_at', '<=', Carbon::parse($date)->endOfDay()));
    }

    private function summaryFor($query): array
    {
        $base = clone $query;
        $statusCounts = (clone $query)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn ($value) => (int) $value)
            ->all();

        $currencyTotals = (clone $query)
            ->select('currency', DB::raw('count(*) as count'), DB::raw('sum(amount) as amount'))
            ->groupBy('currency')
            ->get()
            ->mapWithKeys(fn ($row) => [
                $row->currency => [
                    'count' => (int) $row->count,
                    'amount' => number_format((float) $row->amount, 2, '.', ''),
                ],
            ])
            ->all();

        $providerCounts = (clone $query)
            ->select('provider', DB::raw('count(*) as total'))
            ->groupBy('provider')
            ->pluck('total', 'provider')
            ->map(fn ($value) => (int) $value)
            ->all();

        return [
            'total_count' => (int) $base->count(),
            'status_counts' => $statusCounts,
            'currency_totals' => $currencyTotals,
            'provider_counts' => $providerCounts,
        ];
    }
}
