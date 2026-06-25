<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListBeneficiaryRequest;
use App\Http\Requests\StoreBeneficiaryRequest;
use App\Http\Resources\BeneficiaryResource;
use App\Models\Beneficiary;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class BeneficiaryController extends Controller
{
    public function index(ListBeneficiaryRequest $request)
    {
        $this->authorize('viewAny', Beneficiary::class);

        $filters = $request->validated();
        $sort = $filters['sort'] ?? 'updated_at';
        $direction = $filters['direction'] ?? 'desc';

        $beneficiaries = $this->filteredQuery($filters)
            ->with(['application', 'region', 'village', 'school.region', 'school.village'])
            ->withCount(['needs', 'sponsorships', 'payments', 'impactUpdates'])
            ->withSum('needs as needs_amount_required_sum', 'amount_required')
            ->withSum('needs as needs_amount_funded_sum', 'amount_funded')
            ->withSum('payments as payments_amount_sum', 'amount')
            ->orderBy($sort, $direction)
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return BeneficiaryResource::collection($beneficiaries)
            ->additional([
                'summary' => $this->summaryFor($this->filteredQuery($filters)),
                'filters' => array_filter($filters, fn ($value) => $value !== null && $value !== ''),
            ]);
    }

    public function store(StoreBeneficiaryRequest $request)
    {
        $this->authorize('create', Beneficiary::class);

        return BeneficiaryResource::make(
            Beneficiary::create($request->validated())
                ->load(['application', 'region', 'village', 'school.region', 'school.village', 'needs'])
        );
    }

    public function show(Beneficiary $beneficiary)
    {
        $this->authorize('view', $beneficiary);

        return BeneficiaryResource::make($beneficiary->load([
            'application',
            'region',
            'village',
            'school.region',
            'school.village',
            'needs.allocations.fund',
            'needs.payments',
            'payments.fund',
            'payments.school',
            'sponsorships.donor',
            'sponsorships.fund',
            'impactUpdates',
            'statusHistory.actor:id,name,email',
        ])->loadCount(['needs', 'sponsorships', 'payments', 'impactUpdates'])
            ->loadSum('needs as needs_amount_required_sum', 'amount_required')
            ->loadSum('needs as needs_amount_funded_sum', 'amount_funded')
            ->loadSum('payments as payments_amount_sum', 'amount'));
    }

    public function update(StoreBeneficiaryRequest $request, Beneficiary $beneficiary)
    {
        $this->authorize('update', $beneficiary);

        $beneficiary->update($request->validated());

        return BeneficiaryResource::make($beneficiary->load(['application', 'region', 'village', 'school.region', 'school.village', 'needs']));
    }

    public function destroy(Beneficiary $beneficiary)
    {
        $this->authorize('delete', $beneficiary);
        $beneficiary->delete();

        return response()->noContent();
    }

    private function filteredQuery(array $filters): Builder
    {
        return Beneficiary::query()
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['school_id'] ?? null, fn (Builder $query, int $schoolId) => $query->where('school_id', $schoolId))
            ->when($filters['region_id'] ?? null, fn (Builder $query, int $regionId) => $query->where('region_id', $regionId))
            ->when($filters['gender'] ?? null, fn (Builder $query, string $gender) => $query->where('gender', $gender))
            ->when($filters['education_level'] ?? null, fn (Builder $query, string $level) => $query->where('education_level', $level))
            ->when($filters['academic_year'] ?? null, fn (Builder $query, string $year) => $query->whereHas('needs', fn (Builder $needQuery) => $needQuery->where('academic_year', $year)))
            ->when($filters['sponsor_status'] ?? null, function (Builder $query, string $status): void {
                $status === 'sponsored'
                    ? $query->whereHas('sponsorships', fn (Builder $sponsorshipQuery) => $sponsorshipQuery->where('status', 'active'))
                    : $query->whereDoesntHave('sponsorships', fn (Builder $sponsorshipQuery) => $sponsorshipQuery->where('status', 'active'));
            })
            ->when($filters['funding_status'] ?? null, function (Builder $query, string $status): void {
                $query->whereHas('needs', function (Builder $needQuery) use ($status): void {
                    $status === 'funding_gap'
                        ? $needQuery->whereColumn('amount_funded', '<', 'amount_required')->whereIn('status', ['open', 'partially_funded'])
                        : $needQuery->whereColumn('amount_funded', '>=', 'amount_required')->whereIn('status', ['funded', 'paid']);
                });
            })
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $search = trim($search);

                $query->where(function (Builder $query) use ($search): void {
                    $query->where('internal_id', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('guardian_name', 'like', "%{$search}%")
                        ->orWhere('guardian_phone', 'like', "%{$search}%")
                        ->orWhere('education_level', 'like', "%{$search}%")
                        ->orWhereHas('school', fn (Builder $schoolQuery) => $schoolQuery->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%"))
                        ->orWhereHas('region', fn (Builder $regionQuery) => $regionQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('application', fn (Builder $applicationQuery) => $applicationQuery->where('application_number', 'like', "%{$search}%"));
                });
            });
    }

    private function summaryFor(Builder $query): array
    {
        $statusCounts = (clone $query)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn ($value) => (int) $value)
            ->all();

        $fundingGapCount = (clone $query)
            ->whereHas('needs', fn (Builder $needQuery) => $needQuery
                ->whereColumn('amount_funded', '<', 'amount_required')
                ->whereIn('status', ['open', 'partially_funded']))
            ->count();

        $sponsoredCount = (clone $query)
            ->whereHas('sponsorships', fn (Builder $sponsorshipQuery) => $sponsorshipQuery->where('status', 'active'))
            ->count();

        $schoolChangesCount = (clone $query)
            ->whereHas('statusHistory', fn (Builder $historyQuery) => $historyQuery->where('reason', 'school_change'))
            ->count();

        return [
            'total_count' => (int) (clone $query)->count(),
            'status_counts' => $statusCounts,
            'active_support_count' => (int) ($statusCounts['active_support'] ?? 0),
            'awaiting_sponsorship_count' => (int) ($statusCounts['awaiting_sponsorship'] ?? 0),
            'graduated_count' => (int) ($statusCounts['graduated'] ?? 0),
            'funding_gap_count' => (int) $fundingGapCount,
            'sponsored_count' => (int) $sponsoredCount,
            'school_changes_count' => (int) $schoolChangesCount,
        ];
    }
}
