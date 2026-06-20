<?php

namespace App\Services;

use App\Enums\ApplicationStatus;
use App\Enums\BeneficiaryStatus;
use App\Http\Resources\Concerns\LocalizesResourceLabels;
use App\Models\Allocation;
use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\School;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Support\Collection;

class DashboardSummaryService
{
    use LocalizesResourceLabels;

    public function build(User $user): array
    {
        return [
            'metrics' => $this->metrics($user)->values(),
            'priority_queues' => $this->priorityQueues($user)->values(),
            'recent_activity' => $this->recentActivity($user)->values(),
            'quick_actions' => $this->quickActions($user)->values(),
            'snapshot' => [
                'accessible_modules' => $this->accessibleModules($user)->values(),
                'generated_at' => now()->toISOString(),
            ],
        ];
    }

    private function metrics(User $user): Collection
    {
        $metrics = collect();

        if ($user->can('applications.view')) {
            $metrics->push([
                'key' => 'applications_pending_review',
                'count' => Application::query()
                    ->whereIn('status', [
                        ApplicationStatus::VerificationPending->value,
                        ApplicationStatus::ReviewPending->value,
                    ])
                    ->count(),
                'path' => '/staff/applications?status=verification_pending,review_pending',
                'tone' => 'warning',
            ]);
        }

        if ($user->can('beneficiaries.view')) {
            $metrics->push([
                'key' => 'beneficiaries_supported',
                'count' => Beneficiary::query()
                    ->where('status', '!=', BeneficiaryStatus::Archived->value)
                    ->count(),
                'path' => '/staff/beneficiaries',
                'tone' => 'success',
            ]);
        }

        if ($user->can('schools.view')) {
            $metrics->push([
                'key' => 'schools_connected',
                'count' => School::query()
                    ->where('verification_status', 'verified')
                    ->count(),
                'path' => '/staff/beneficiaries',
                'tone' => 'info',
            ]);
        }

        if ($user->can('donors.view')) {
            $metrics->push([
                'key' => 'active_sponsorships',
                'count' => Sponsorship::query()
                    ->where('status', 'active')
                    ->count(),
                'path' => '/staff/funding',
                'tone' => 'success',
            ]);
        }

        if ($user->can('allocations.view')) {
            $metrics->push([
                'key' => 'funding_awaiting_allocation',
                'count' => Donation::query()
                    ->where('status', 'confirmed')
                    ->whereDoesntHave('allocations')
                    ->count(),
                'path' => '/staff/funding',
                'tone' => 'warning',
            ]);
        }

        if ($user->can('impact_updates.view')) {
            $metrics->push([
                'key' => 'reports_due',
                'count' => Beneficiary::query()
                    ->where('status', BeneficiaryStatus::ActiveSupport->value)
                    ->whereDoesntHave('impactUpdates', fn ($query) => $query->where('created_at', '>=', now()->subDays(30)))
                    ->count(),
                'path' => '/staff/reports',
                'tone' => 'info',
            ]);
        }

        return $metrics;
    }

    private function priorityQueues(User $user): Collection
    {
        $queues = collect();

        if ($user->can('applications.view')) {
            $queues->push([
                'key' => 'applications_verification',
                'count' => Application::query()->where('status', ApplicationStatus::VerificationPending->value)->count(),
                'path' => '/staff/applications?status=verification_pending',
                'items' => Application::query()
                    ->with(['school', 'region'])
                    ->where('status', ApplicationStatus::VerificationPending->value)
                    ->latest('updated_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (Application $application) => [
                        'id' => $application->uuid,
                        'reference' => $application->application_number,
                        'title' => $application->applicant_name,
                        'status' => $application->status->value,
                        'status_label' => $this->localizedLabel('application_statuses', $application->status),
                        'secondary' => $this->joinParts([
                            $application->school?->name,
                            $application->region?->name,
                        ]),
                        'updated_at' => $application->updated_at?->toISOString(),
                        'path' => '/staff/applications?search='.$application->application_number,
                    ])
                    ->values(),
            ]);

            $queues->push([
                'key' => 'applications_review',
                'count' => Application::query()->where('status', ApplicationStatus::ReviewPending->value)->count(),
                'path' => '/staff/applications?status=review_pending',
                'items' => Application::query()
                    ->with(['school', 'region'])
                    ->where('status', ApplicationStatus::ReviewPending->value)
                    ->latest('updated_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (Application $application) => [
                        'id' => $application->uuid,
                        'reference' => $application->application_number,
                        'title' => $application->applicant_name,
                        'status' => $application->status->value,
                        'status_label' => $this->localizedLabel('application_statuses', $application->status),
                        'secondary' => $this->joinParts([
                            $application->school?->name,
                            $application->region?->name,
                        ]),
                        'updated_at' => $application->updated_at?->toISOString(),
                        'path' => '/staff/applications?search='.$application->application_number,
                    ])
                    ->values(),
            ]);
        }

        if ($user->can('beneficiaries.view')) {
            $queues->push([
                'key' => 'beneficiaries_awaiting_sponsorship',
                'count' => Beneficiary::query()->where('status', BeneficiaryStatus::AwaitingSponsorship->value)->count(),
                'path' => '/staff/beneficiaries?status=awaiting_sponsorship',
                'items' => Beneficiary::query()
                    ->with(['school', 'region'])
                    ->where('status', BeneficiaryStatus::AwaitingSponsorship->value)
                    ->latest('updated_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (Beneficiary $beneficiary) => [
                        'id' => $beneficiary->uuid,
                        'reference' => $beneficiary->internal_id,
                        'title' => trim($beneficiary->first_name.' '.$beneficiary->last_name),
                        'status' => $beneficiary->status->value,
                        'status_label' => $this->localizedLabel('beneficiary_statuses', $beneficiary->status),
                        'secondary' => $this->joinParts([
                            $beneficiary->school?->name,
                            $beneficiary->region?->name,
                        ]),
                        'updated_at' => $beneficiary->updated_at?->toISOString(),
                        'path' => '/staff/beneficiaries?search='.$beneficiary->internal_id,
                    ])
                    ->values(),
            ]);
        }

        if ($user->can('allocations.view')) {
            $queues->push([
                'key' => 'allocations_pending',
                'count' => Allocation::query()->where('status', 'proposed')->count(),
                'path' => '/staff/funding?allocation_status=proposed',
                'items' => Allocation::query()
                    ->with(['donation.donor', 'educationalNeed.beneficiary'])
                    ->where('status', 'proposed')
                    ->latest('updated_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (Allocation $allocation) => [
                        'id' => $allocation->uuid,
                        'reference' => $allocation->allocation_reference,
                        'title' => $allocation->donation?->donor?->name ?: $allocation->allocation_reference,
                        'status' => $allocation->status,
                        'status_label' => $this->localizedLabel('allocation_statuses', $allocation->status),
                        'secondary' => $allocation->educationalNeed?->title,
                        'updated_at' => $allocation->updated_at?->toISOString(),
                        'path' => '/staff/funding?search='.$allocation->allocation_reference,
                    ])
                    ->values(),
            ]);
        }

        if ($user->can('payments.view')) {
            $queues->push([
                'key' => 'payments_pending_approval',
                'count' => Payment::query()->where('status', 'pending')->count(),
                'path' => '/staff/funding?payment_status=pending',
                'items' => Payment::query()
                    ->with(['school', 'beneficiary'])
                    ->where('status', 'pending')
                    ->latest('updated_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (Payment $payment) => [
                        'id' => $payment->uuid,
                        'reference' => $payment->payment_reference,
                        'title' => $payment->payee_name,
                        'status' => $payment->status,
                        'status_label' => $this->localizedLabel('payment_statuses', $payment->status),
                        'secondary' => $this->joinParts([
                            $payment->school?->name,
                            $payment->beneficiary?->internal_id,
                        ]),
                        'updated_at' => $payment->updated_at?->toISOString(),
                        'path' => '/staff/funding?search='.$payment->payment_reference,
                    ])
                    ->values(),
            ]);
        }

        return $queues->filter(fn (array $queue) => $queue['count'] > 0 || count($queue['items']) > 0)->values();
    }

    private function recentActivity(User $user): Collection
    {
        $activity = collect();

        if ($user->can('applications.view')) {
            $activity = $activity->concat(
                Application::query()
                    ->latest('updated_at')
                    ->limit(4)
                    ->get()
                    ->map(fn (Application $application) => [
                        'key' => 'application',
                        'reference' => $application->application_number,
                        'title' => $application->applicant_name,
                        'description' => $this->localizedLabel('application_statuses', $application->status),
                        'happened_at' => $application->updated_at?->toISOString(),
                        'path' => '/staff/applications?search='.$application->application_number,
                    ])
            );
        }

        if ($user->can('beneficiaries.view')) {
            $activity = $activity->concat(
                Beneficiary::query()
                    ->latest('updated_at')
                    ->limit(4)
                    ->get()
                    ->map(fn (Beneficiary $beneficiary) => [
                        'key' => 'beneficiary',
                        'reference' => $beneficiary->internal_id,
                        'title' => trim($beneficiary->first_name.' '.$beneficiary->last_name),
                        'description' => $this->localizedLabel('beneficiary_statuses', $beneficiary->status),
                        'happened_at' => $beneficiary->updated_at?->toISOString(),
                        'path' => '/staff/beneficiaries?search='.$beneficiary->internal_id,
                    ])
            );
        }

        if ($user->can('donations.view')) {
            $activity = $activity->concat(
                Donation::query()
                    ->with('donor')
                    ->latest('updated_at')
                    ->limit(4)
                    ->get()
                    ->map(fn (Donation $donation) => [
                        'key' => 'donation',
                        'reference' => $donation->reference_number,
                        'title' => $donation->donor?->name ?: $donation->reference_number,
                        'description' => $this->localizedLabel('donation_statuses', $donation->status),
                        'happened_at' => $donation->updated_at?->toISOString(),
                        'path' => '/staff/funding?search='.$donation->reference_number,
                    ])
            );
        }

        if ($user->can('payments.view')) {
            $activity = $activity->concat(
                Payment::query()
                    ->latest('updated_at')
                    ->limit(4)
                    ->get()
                    ->map(fn (Payment $payment) => [
                        'key' => 'payment',
                        'reference' => $payment->payment_reference,
                        'title' => $payment->payee_name,
                        'description' => $this->localizedLabel('payment_statuses', $payment->status),
                        'happened_at' => $payment->updated_at?->toISOString(),
                        'path' => '/staff/funding?search='.$payment->payment_reference,
                    ])
            );
        }

        return $activity
            ->filter(fn (array $item) => filled($item['happened_at']))
            ->sortByDesc('happened_at')
            ->take(8)
            ->values();
    }

    private function quickActions(User $user): Collection
    {
        return collect([
            [
                'key' => 'applications_review',
                'permission' => 'applications.view',
                'path' => '/staff/applications?status=verification_pending,review_pending',
            ],
            [
                'key' => 'beneficiaries_open',
                'permission' => 'beneficiaries.view',
                'path' => '/staff/beneficiaries',
            ],
            [
                'key' => 'funding_open',
                'permission' => 'funds.view',
                'path' => '/staff/funding',
            ],
            [
                'key' => 'reports_open',
                'permission' => 'impact_updates.view',
                'path' => '/staff/reports',
            ],
        ])->filter(fn (array $action) => $user->can($action['permission']))->values();
    }

    private function accessibleModules(User $user): Collection
    {
        return collect([
            ['key' => 'dashboard', 'permission' => null],
            ['key' => 'applications', 'permission' => 'applications.view'],
            ['key' => 'beneficiaries', 'permission' => 'beneficiaries.view'],
            ['key' => 'schools', 'permission' => 'schools.view'],
            ['key' => 'funding', 'permission' => 'funds.view'],
            ['key' => 'donors', 'permission' => 'donors.view'],
            ['key' => 'payments', 'permission' => 'payments.view'],
            ['key' => 'reports', 'permission' => 'impact_updates.view'],
            ['key' => 'settings', 'permission' => 'roles.manage'],
        ])->filter(fn (array $module) => $module['permission'] === null || $user->can($module['permission']))
            ->map(fn (array $module) => $module['key']);
    }

    private function joinParts(array $parts): ?string
    {
        $parts = array_values(array_filter($parts, fn ($part) => filled($part)));

        return $parts === [] ? null : implode(' • ', $parts);
    }
}
