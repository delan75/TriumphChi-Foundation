<?php

namespace App\Services\Reports;

use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Donation;
use App\Models\EducationalNeed;
use App\Models\Payment;
use App\Models\Region;
use App\Models\ReportRequest;
use App\Models\School;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReportCatalogService
{
    public function dashboard(User $user): array
    {
        $templates = $this->visibleTemplates($user);
        $queue = $this->queueFor($user);

        return [
            'categories' => $this->categories($templates),
            'quick_reports' => $this->visibleQuickReports($user),
            'templates' => array_values($templates),
            'insights' => $this->visibleInsights($user),
            'filter_options' => $this->filterOptions(),
            'queue' => $queue,
            'saved_reports' => $queue->whereIn('status', ['completed'])->values()->all(),
            'scheduled_reports' => [],
        ];
    }

    public function queueFor(User $user): \Illuminate\Support\Collection
    {
        return ReportRequest::query()
            ->where('requested_by', $user->id)
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn (ReportRequest $request) => $this->requestPayload($request));
    }

    public function createRequest(User $user, array $payload): ReportRequest
    {
        $templates = collect($this->visibleTemplates($user))->keyBy('key');
        $template = $templates->get($payload['template_key']);

        if (! $template) {
            throw ValidationException::withMessages([
                'template_key' => [__('api.reports.template_unavailable')],
            ]);
        }

        $format = (string) ($payload['format'] ?? $template['format']);

        if (! in_array($format, $template['formats'], true)) {
            throw ValidationException::withMessages([
                'format' => [__('api.reports.format_unavailable')],
            ]);
        }

        $filters = $this->sanitizeFilters($payload['filters'] ?? []);
        $this->assertAvailableFilters($filters);

        return ReportRequest::create([
            'requested_by' => $user->id,
            'template_key' => $template['key'],
            'title' => $template['name'],
            'category' => $template['category'],
            'format' => $format,
            'status' => 'queued',
            'progress' => 5,
            'filters' => $filters,
            'fields' => array_values(array_filter($payload['fields'] ?? [])),
            'metadata' => [
                'source' => $payload['source'] ?? 'reports_page',
            ],
            'queued_at' => now(),
            'expires_at' => now()->addDays(14),
        ]);
    }

    public function requestPayload(ReportRequest $request): array
    {
        return [
            'uuid' => $request->uuid,
            'template_key' => $request->template_key,
            'title' => $request->title,
            'category' => $request->category,
            'format' => $request->format,
            'status' => $request->status,
            'status_label' => __('labels.report_request_statuses.'.$request->status),
            'progress' => $request->progress,
            'filters' => $request->filters ?? [],
            'fields' => $request->fields ?? [],
            'queued_at' => $request->queued_at?->toISOString(),
            'started_at' => $request->started_at?->toISOString(),
            'completed_at' => $request->completed_at?->toISOString(),
            'failed_at' => $request->failed_at?->toISOString(),
            'expires_at' => $request->expires_at?->toISOString(),
        ];
    }

    private function visibleTemplates(User $user): array
    {
        return array_values(array_filter($this->templates(), fn (array $template) => $this->canAccess($user, $template['permissions'])));
    }

    private function visibleQuickReports(User $user): array
    {
        return array_values(array_filter($this->quickReports(), fn (array $report) => $user->can($report['permission'])));
    }

    private function visibleInsights(User $user): array
    {
        return array_values(array_filter($this->insights(), fn (array $insight) => $user->can($insight['permission'])));
    }

    private function canAccess(User $user, array $permissions): bool
    {
        return collect($permissions)->contains(fn (string $permission) => $user->can($permission));
    }

    private function categories(array $templates): array
    {
        return collect($templates)
            ->groupBy('category')
            ->map(fn ($group, string $category) => [
                'key' => $category,
                'label' => __('labels.report_categories.'.$category),
                'available' => $group->count(),
                'description' => __('labels.report_category_descriptions.'.$category),
            ])
            ->values()
            ->all();
    }

    private function filterOptions(): array
    {
        return [
            'regions' => Region::query()
                ->where(fn ($query) => $query
                    ->whereHas('applications')
                    ->orWhereHas('beneficiaries')
                    ->orWhereHas('schools'))
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(fn (Region $region) => [
                    'value' => (string) $region->id,
                    'label' => $region->name,
                    'code' => $region->code,
                ])
                ->values()
                ->all(),
            'schools' => School::query()
                ->where(fn ($query) => $query
                    ->whereHas('applications')
                    ->orWhereHas('beneficiaries')
                    ->orWhereHas('payments'))
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(fn (School $school) => [
                    'value' => (string) $school->id,
                    'label' => $school->name,
                    'code' => $school->code,
                ])
                ->values()
                ->all(),
            'academic_years' => EducationalNeed::query()
                ->whereNotNull('academic_year')
                ->select('academic_year')
                ->distinct()
                ->orderByDesc('academic_year')
                ->pluck('academic_year')
                ->map(fn (string $year) => ['value' => $year, 'label' => $year])
                ->values()
                ->all(),
            'support_statuses' => Beneficiary::query()
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->orderBy('status')
                ->get()
                ->map(function ($row) {
                    $status = $row->status instanceof \BackedEnum
                        ? $row->status->value
                        : (string) $row->status;

                    return [
                    'value' => $status,
                    'label' => __('labels.beneficiary_statuses.'.$status),
                    'count' => (int) $row->total,
                    ];
                })
                ->values()
                ->all(),
            'funding_statuses' => $this->fundingStatusOptions(),
        ];
    }

    private function fundingStatusOptions(): array
    {
        $needs = EducationalNeed::query()
            ->selectRaw('
                sum(case when amount_required > amount_funded then 1 else 0 end) as funding_gap,
                sum(case when amount_funded > 0 and amount_funded < amount_required then 1 else 0 end) as partially_funded,
                sum(case when amount_required > 0 and amount_funded >= amount_required then 1 else 0 end) as fully_funded
            ')
            ->first();

        return collect([
            ['value' => 'funding_gap', 'label' => __('labels.report_funding_statuses.funding_gap'), 'count' => (int) ($needs->funding_gap ?? 0)],
            ['value' => 'partially_funded', 'label' => __('labels.report_funding_statuses.partially_funded'), 'count' => (int) ($needs->partially_funded ?? 0)],
            ['value' => 'fully_funded', 'label' => __('labels.report_funding_statuses.fully_funded'), 'count' => (int) ($needs->fully_funded ?? 0)],
        ])->filter(fn (array $option) => $option['count'] > 0)->values()->all();
    }

    private function assertAvailableFilters(array $filters): void
    {
        $options = $this->filterOptions();
        $errors = [];

        foreach ([
            'region_id' => 'regions',
            'school_id' => 'schools',
            'academic_year' => 'academic_years',
            'support_status' => 'support_statuses',
            'funding_status' => 'funding_statuses',
        ] as $filter => $optionKey) {
            if (! isset($filters[$filter]) || $filters[$filter] === '') {
                continue;
            }

            $available = collect($options[$optionKey])->pluck('value')->all();

            if (! in_array((string) $filters[$filter], $available, true)) {
                $errors["filters.{$filter}"] = [__('api.reports.filter_unavailable')];
            }
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function sanitizeFilters(array $filters): array
    {
        return Arr::only($filters, [
            'region_id',
            'school_id',
            'academic_year',
            'support_status',
            'funding_status',
        ]);
    }

    private function templates(): array
    {
        return [
            ['key' => 'beneficiary-summary', 'name' => __('labels.report_templates.beneficiary_summary'), 'category' => 'beneficiaries', 'format' => 'PDF', 'formats' => ['PDF', 'Excel', 'CSV'], 'permissions' => ['beneficiaries.view'], 'last_generated' => null],
            ['key' => 'funding-gap', 'name' => __('labels.report_templates.funding_gap'), 'category' => 'funding', 'format' => 'Excel', 'formats' => ['Excel', 'CSV'], 'permissions' => ['funds.view', 'allocations.view'], 'last_generated' => null],
            ['key' => 'school-payments', 'name' => __('labels.report_templates.school_payments'), 'category' => 'payments', 'format' => 'Excel', 'formats' => ['Excel', 'CSV'], 'permissions' => ['payments.view'], 'last_generated' => null],
            ['key' => 'application-pipeline', 'name' => __('labels.report_templates.application_pipeline'), 'category' => 'applications', 'format' => 'PDF', 'formats' => ['PDF', 'Excel', 'CSV'], 'permissions' => ['applications.view'], 'last_generated' => null],
            ['key' => 'donor-contributions', 'name' => __('labels.report_templates.donor_contributions'), 'category' => 'donations', 'format' => 'CSV', 'formats' => ['CSV', 'Excel'], 'permissions' => ['donations.view'], 'last_generated' => null],
            ['key' => 'impact-summary', 'name' => __('labels.report_templates.impact_summary'), 'category' => 'impact', 'format' => 'PDF', 'formats' => ['PDF'], 'permissions' => ['impact_updates.view', 'reports.view'], 'last_generated' => null],
            ['key' => 'schools-by-region', 'name' => __('labels.report_templates.schools_by_region'), 'category' => 'schools', 'format' => 'Excel', 'formats' => ['Excel', 'CSV'], 'permissions' => ['schools.view'], 'last_generated' => null],
            ['key' => 'payment-audit', 'name' => __('labels.report_templates.payment_audit'), 'category' => 'payments', 'format' => 'CSV', 'formats' => ['CSV', 'Excel'], 'permissions' => ['payments.view'], 'last_generated' => null],
        ];
    }

    private function quickReports(): array
    {
        return [
            ['key' => 'applications-awaiting-review', 'template_key' => 'application-pipeline', 'title' => __('labels.quick_reports.applications_awaiting_review'), 'description' => __('labels.quick_report_descriptions.applications_awaiting_review'), 'category' => 'applications', 'permission' => 'applications.view', 'severity' => 'warning'],
            ['key' => 'children-awaiting-funding', 'template_key' => 'funding-gap', 'title' => __('labels.quick_reports.children_awaiting_funding'), 'description' => __('labels.quick_report_descriptions.children_awaiting_funding'), 'category' => 'funding', 'permission' => 'funds.view', 'severity' => 'danger'],
            ['key' => 'upcoming-school-payments', 'template_key' => 'school-payments', 'title' => __('labels.quick_reports.upcoming_school_payments'), 'description' => __('labels.quick_report_descriptions.upcoming_school_payments'), 'category' => 'payments', 'permission' => 'payments.view', 'severity' => 'warning'],
            ['key' => 'donations-this-month', 'template_key' => 'donor-contributions', 'title' => __('labels.quick_reports.donations_this_month'), 'description' => __('labels.quick_report_descriptions.donations_this_month'), 'category' => 'donations', 'permission' => 'donations.view', 'severity' => 'success'],
            ['key' => 'outstanding-needs', 'template_key' => 'beneficiary-summary', 'title' => __('labels.quick_reports.outstanding_needs'), 'description' => __('labels.quick_report_descriptions.outstanding_needs'), 'category' => 'beneficiaries', 'permission' => 'beneficiaries.view', 'severity' => 'info'],
            ['key' => 'beneficiaries-by-school', 'template_key' => 'schools-by-region', 'title' => __('labels.quick_reports.beneficiaries_by_school'), 'description' => __('labels.quick_report_descriptions.beneficiaries_by_school'), 'category' => 'schools', 'permission' => 'schools.view', 'severity' => 'neutral'],
        ];
    }

    private function insights(): array
    {
        return [
            ['key' => 'review', 'label' => __('labels.report_insights.review'), 'value' => (string) Application::query()->whereIn('status', ['submitted', 'verification_pending', 'review_pending'])->count(), 'tone' => 'warning', 'path' => '/staff/applications', 'permission' => 'applications.view'],
            ['key' => 'gaps', 'label' => __('labels.report_insights.gaps'), 'value' => (string) EducationalNeed::query()->whereColumn('amount_required', '>', 'amount_funded')->count(), 'tone' => 'danger', 'path' => '/staff/beneficiaries', 'permission' => 'beneficiaries.view'],
            ['key' => 'payments', 'label' => __('labels.report_insights.payments'), 'value' => (string) Payment::query()->where('status', 'pending')->count(), 'tone' => 'warning', 'path' => '/staff/funding', 'permission' => 'payments.view'],
            ['key' => 'schools', 'label' => __('labels.report_insights.schools'), 'value' => (string) School::query()->whereHas('payments', fn ($query) => $query->where('status', 'pending'))->count(), 'tone' => 'info', 'path' => '/staff/funding', 'permission' => 'payments.view'],
            ['key' => 'donations', 'label' => __('labels.report_insights.donations'), 'value' => (string) Donation::query()->where('status', 'confirmed')->whereMonth('confirmed_at', now()->month)->count(), 'tone' => 'success', 'path' => '/staff/funding', 'permission' => 'donations.view'],
        ];
    }
}
