<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListDonationManagementRequest;
use App\Http\Requests\StoreDonationRequest;
use App\Http\Resources\DonationManagementResource;
use App\Http\Resources\DonationResource;
use App\Models\Donation;
use App\Models\DonationDocument;
use App\Models\Region;
use App\Services\DonationDocumentService;
use App\Services\DonationPaymentReconciliationService;
use App\Services\FundingTransactionService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Str;
use Spatie\LaravelPdf\Facades\Pdf;

class DonationController extends Controller
{
    public function index(ListDonationManagementRequest $request)
    {
        $filters = $request->validated();
        $query = $this->managementQuery($filters);
        $summary = $this->summaryFor($this->filteredDonationQuery($filters), $this->filteredDonationQuery([]));
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

    public function refreshPaymentStatus(
        Donation $donation,
        DonationPaymentReconciliationService $reconciliation,
        DonationDocumentService $documents,
    ) {
        $donation = $reconciliation->reconcileDonation($donation);

        if (($donation->status->value ?? $donation->status) === 'confirmed') {
            $documents->ensureIssuedDocuments($donation, app()->getLocale());
            $donation->load('documents');
        }

        return DonationManagementResource::make($donation)
            ->additional([
                'message' => __('api.messages.donation_payment_status_refreshed'),
            ]);
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
            ->when($filters['source'] ?? null, fn ($query, string $source) => $query->where('provider', $source))
            ->when($filters['method'] ?? null, fn ($query, string $method) => $query->where('method', $method))
            ->when($filters['currency'] ?? null, fn ($query, string $currency) => $query->where('currency', strtoupper($currency)))
            ->when($filters['country'] ?? null, fn ($query, string $country) => $query->where('metadata->country', strtoupper($country)))
            ->when($filters['region_id'] ?? null, fn ($query, int $regionId) => $query->whereHas(
                'allocations.educationalNeed.beneficiary',
                fn ($beneficiaryQuery) => $beneficiaryQuery->where('region_id', $regionId),
            ))
            ->when($filters['fund_id'] ?? null, fn ($query, int $fundId) => $query->where('fund_id', $fundId))
            ->when($filters['donor_id'] ?? null, fn ($query, int $donorId) => $query->where('donor_id', $donorId))
            ->when($filters['donated_from'] ?? null, fn ($query, string $date) => $query->where('donated_at', '>=', Carbon::parse($date)->startOfDay()))
            ->when($filters['donated_to'] ?? null, fn ($query, string $date) => $query->where('donated_at', '<=', Carbon::parse($date)->endOfDay()));
    }

    private function summaryFor($query, $optionsQuery = null): array
    {
        $base = clone $query;
        $optionsQuery ??= clone $query;
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

        $sourceDistribution = (clone $query)
            ->select('provider', 'currency', DB::raw('count(*) as count'), DB::raw('sum(amount) as amount'))
            ->whereNotNull('provider')
            ->groupBy('provider', 'currency')
            ->orderByDesc(DB::raw('sum(amount)'))
            ->get()
            ->map(function ($row) {
                $source = $row->provider ?: 'unknown';

                return [
                    'source' => $source,
                    'source_label' => Lang::has("labels.payment_providers.{$source}")
                        ? __("labels.payment_providers.{$source}")
                        : Str::of($source)->replace('_', ' ')->title()->toString(),
                    'currency' => $row->currency,
                    'count' => (int) $row->count,
                    'amount' => number_format((float) $row->amount, 2, '.', ''),
                ];
            })
            ->values()
            ->all();

        $countryExpression = DB::connection()->getDriverName() === 'sqlite'
            ? "JSON_EXTRACT(metadata, '$.country')"
            : "JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.country'))";

        $filterStatusCounts = (clone $optionsQuery)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn ($value) => (int) $value)
            ->all();

        $filterProviderCounts = (clone $optionsQuery)
            ->select('provider', DB::raw('count(*) as total'))
            ->whereNotNull('provider')
            ->groupBy('provider')
            ->pluck('total', 'provider')
            ->map(fn ($value) => (int) $value)
            ->all();

        $filterCurrencyTotals = (clone $optionsQuery)
            ->select('currency', DB::raw('sum(amount) as amount'))
            ->groupBy('currency')
            ->pluck('amount', 'currency')
            ->map(fn ($value) => number_format((float) $value, 2, '.', ''))
            ->all();

        $countryOptions = (clone $optionsQuery)
            ->selectRaw("{$countryExpression} as country")
            ->whereNotNull('metadata')
            ->get()
            ->pluck('country')
            ->filter()
            ->unique()
            ->sort()
            ->map(fn ($country) => [
                'value' => (string) $country,
                'label' => (string) $country,
            ])
            ->values()
            ->all();

        $regionOptions = Region::query()
            ->whereHas('beneficiaries.needs.allocations.donation')
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn (Region $region) => [
                'value' => (string) $region->id,
                'label' => $region->name,
                'code' => $region->code,
            ])
            ->values()
            ->all();

        return [
            'total_count' => (int) $base->count(),
            'status_counts' => $statusCounts,
            'currency_totals' => $currencyTotals,
            'provider_counts' => $providerCounts,
            'source_distribution' => $sourceDistribution,
            'filter_options' => [
                'statuses' => array_keys($filterStatusCounts),
                'providers' => array_keys($filterProviderCounts),
                'currencies' => array_keys($filterCurrencyTotals),
                'countries' => $countryOptions,
                'regions' => $regionOptions,
            ],
        ];
    }
}
