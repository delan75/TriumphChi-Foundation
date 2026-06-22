<?php

namespace App\Services;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Donation;
use App\Models\Donor;
use App\Models\Fund;
use App\Models\Payment;
use App\Models\School;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class GlobalSearchService
{
    use LocalizesResourceLabels;

    public function search(User $user, string $term, int $limit = 8): array
    {
        $query = trim($term);
        $limit = max(1, min($limit, 20));
        $perScopeLimit = max(2, min(4, $limit));

        $groups = [];
        $results = collect();

        foreach ($this->definitions() as $definition) {
            if (! $user->can($definition['permission'])) {
                continue;
            }

            $items = ($definition['search'])($query, $perScopeLimit);

            if ($items->isEmpty()) {
                continue;
            }

            $label = __('api.search.groups.'.$definition['resource']);
            $groups[] = [
                'key' => $definition['resource'],
                'label' => $label,
                'count' => $items->count(),
                'module' => $definition['module'],
                'module_path' => $definition['module_path'],
            ];

            $results = $results->concat(
                $items->map(fn (array $item): array => [
                    ...$item,
                    'resource' => $definition['resource'],
                    'resource_label' => $label,
                    'module' => $definition['module'],
                    'module_path' => $definition['module_path'],
                ]),
            );
        }

        $results = $results->take($limit)->values();
        $visibleGroups = collect($groups)
            ->map(function (array $group) use ($results): ?array {
                $count = $results->where('resource', $group['key'])->count();

                if ($count === 0) {
                    return null;
                }

                $group['count'] = $count;

                return $group;
            })
            ->filter()
            ->values();

        return [
            'query' => $query,
            'results' => $results,
            'groups' => $visibleGroups,
            'meta' => [
                'returned' => $results->count(),
                'group_count' => $visibleGroups->count(),
                'limit' => $limit,
            ],
        ];
    }

    private function definitions(): array
    {
        return [
            [
                'resource' => 'applications',
                'permission' => 'applications.view',
                'module' => 'applications',
                'module_path' => '/staff/applications',
                'search' => fn (string $term, int $limit): Collection => Application::query()
                    ->with(['school', 'region'])
                    ->where(function (Builder $query) use ($term): void {
                        $this->whereAnyLike($query, [
                            'application_number',
                            'applicant_name',
                            'guardian_name',
                            'guardian_phone',
                        ], $term);
                    })
                    ->latest()
                    ->limit($limit)
                    ->get()
                    ->map(fn (Application $application): array => [
                        'id' => $application->uuid,
                        'reference' => $application->application_number,
                        'title' => $application->applicant_name,
                        'subtitle' => $this->joinSummary([
                            $this->localizedLabel('application_statuses', $application->status),
                            $application->school?->name,
                            $application->region?->name,
                        ]),
                        'status' => $this->normalizedLabelValue($application->status),
                        'status_label' => $this->localizedLabel('application_statuses', $application->status),
                    ]),
            ],
            [
                'resource' => 'beneficiaries',
                'permission' => 'beneficiaries.view',
                'module' => 'beneficiaries',
                'module_path' => '/staff/beneficiaries',
                'search' => fn (string $term, int $limit): Collection => Beneficiary::query()
                    ->with(['school', 'region'])
                    ->where(function (Builder $query) use ($term): void {
                        $this->whereAnyLike($query, [
                            'internal_id',
                            'first_name',
                            'last_name',
                            'guardian_name',
                            'guardian_phone',
                        ], $term);
                    })
                    ->latest()
                    ->limit($limit)
                    ->get()
                    ->map(fn (Beneficiary $beneficiary): array => [
                        'id' => $beneficiary->uuid,
                        'reference' => $beneficiary->internal_id,
                        'title' => trim($beneficiary->first_name.' '.$beneficiary->last_name),
                        'subtitle' => $this->joinSummary([
                            $this->localizedLabel('beneficiary_statuses', $beneficiary->status),
                            $beneficiary->school?->name,
                            $beneficiary->region?->name,
                        ]),
                        'status' => $this->normalizedLabelValue($beneficiary->status),
                        'status_label' => $this->localizedLabel('beneficiary_statuses', $beneficiary->status),
                    ]),
            ],
            [
                'resource' => 'schools',
                'permission' => 'schools.view',
                'module' => 'beneficiaries',
                'module_path' => '/staff/beneficiaries',
                'search' => fn (string $term, int $limit): Collection => School::query()
                    ->with(['region', 'village'])
                    ->where(function (Builder $query) use ($term): void {
                        $this->whereAnyLike($query, [
                            'code',
                            'name',
                            'principal_name',
                            'phone',
                            'email',
                        ], $term);
                    })
                    ->orderBy('name')
                    ->limit($limit)
                    ->get()
                    ->map(fn (School $school): array => [
                        'id' => $school->uuid,
                        'reference' => $school->code,
                        'title' => $school->name,
                        'subtitle' => $this->joinSummary([
                            $this->localizedLabel('school_verification_statuses', $school->verification_status),
                            $school->region?->name,
                            $school->village?->name,
                        ]),
                        'status' => $school->verification_status,
                        'status_label' => $this->localizedLabel('school_verification_statuses', $school->verification_status),
                    ]),
            ],
            [
                'resource' => 'donors',
                'permission' => 'donors.view',
                'module' => 'funding',
                'module_path' => '/staff/funding',
                'search' => fn (string $term, int $limit): Collection => Donor::query()
                    ->where(function (Builder $query) use ($term): void {
                        $this->whereAnyLike($query, [
                            'name',
                            'email',
                            'phone',
                            'type',
                        ], $term);
                    })
                    ->orderBy('name')
                    ->limit($limit)
                    ->get()
                    ->map(fn (Donor $donor): array => [
                        'id' => $donor->uuid,
                        'reference' => $donor->email ?: $donor->phone,
                        'title' => $donor->name,
                        'subtitle' => $this->joinSummary([
                            $this->localizedLabel('donor_types', $donor->type),
                            $this->localizedLabel('donor_statuses', $donor->status),
                        ]),
                        'status' => $donor->status,
                        'status_label' => $this->localizedLabel('donor_statuses', $donor->status),
                    ]),
            ],
            [
                'resource' => 'donations',
                'permission' => 'donations.view',
                'module' => 'funding',
                'module_path' => '/staff/funding',
                'search' => fn (string $term, int $limit): Collection => Donation::query()
                    ->with(['donor', 'fund'])
                    ->where(function (Builder $query) use ($term): void {
                        $this->whereAnyLike($query, [
                            'reference_number',
                            'provider_reference',
                            'method',
                            'provider',
                        ], $term);

                        $query->orWhereHas('donor', function (Builder $donorQuery) use ($term): void {
                            $this->whereAnyLike($donorQuery, ['name', 'email'], $term);
                        });
                    })
                    ->latest('donated_at')
                    ->limit($limit)
                    ->get()
                    ->map(fn (Donation $donation): array => [
                        'id' => $donation->uuid,
                        'reference' => $donation->reference_number,
                        'title' => $donation->donor?->name ?: __('api.search.fallbacks.donation'),
                        'subtitle' => $this->joinSummary([
                            $this->moneyLabel($donation->amount, $donation->currency),
                            $this->localizedLabel('donation_statuses', $donation->status),
                            $donation->fund?->name,
                        ]),
                        'status' => $this->normalizedLabelValue($donation->status),
                        'status_label' => $this->localizedLabel('donation_statuses', $donation->status),
                    ]),
            ],
            [
                'resource' => 'funds',
                'permission' => 'funds.view',
                'module' => 'funding',
                'module_path' => '/staff/funding',
                'search' => fn (string $term, int $limit): Collection => Fund::query()
                    ->where(function (Builder $query) use ($term): void {
                        $this->whereAnyLike($query, [
                            'code',
                            'name',
                            'slug',
                            'restriction_type',
                            'status',
                        ], $term);
                    })
                    ->orderBy('name')
                    ->limit($limit)
                    ->get()
                    ->map(fn (Fund $fund): array => [
                        'id' => $fund->uuid,
                        'reference' => $fund->code,
                        'title' => $fund->name,
                        'subtitle' => $this->joinSummary([
                            $this->localizedLabel('fund_statuses', $fund->status),
                            $this->localizedLabel('fund_restriction_types', $fund->restriction_type),
                        ]),
                        'status' => $fund->status,
                        'status_label' => $this->localizedLabel('fund_statuses', $fund->status),
                    ]),
            ],
            [
                'resource' => 'payments',
                'permission' => 'payments.view',
                'module' => 'funding',
                'module_path' => '/staff/funding',
                'search' => fn (string $term, int $limit): Collection => Payment::query()
                    ->with(['school', 'beneficiary'])
                    ->where(function (Builder $query) use ($term): void {
                        $this->whereAnyLike($query, [
                            'payment_reference',
                            'payee_name',
                            'vendor_reference',
                            'method',
                            'status',
                        ], $term);
                    })
                    ->latest('payment_date')
                    ->limit($limit)
                    ->get()
                    ->map(fn (Payment $payment): array => [
                        'id' => $payment->uuid,
                        'reference' => $payment->payment_reference,
                        'title' => $payment->payee_name,
                        'subtitle' => $this->joinSummary([
                            $this->moneyLabel($payment->amount, $payment->currency),
                            $this->localizedLabel('payment_statuses', $payment->status),
                            $payment->school?->name,
                        ]),
                        'status' => $payment->status,
                        'status_label' => $this->localizedLabel('payment_statuses', $payment->status),
                    ]),
            ],
            [
                'resource' => 'sponsorships',
                'permission' => 'donors.view',
                'module' => 'funding',
                'module_path' => '/staff/funding',
                'search' => fn (string $term, int $limit): Collection => Sponsorship::query()
                    ->with(['donor', 'beneficiary'])
                    ->where(function (Builder $query) use ($term): void {
                        $this->whereAnyLike($query, [
                            'sponsorship_reference',
                            'type',
                            'status',
                        ], $term);

                        $query->orWhereHas('donor', function (Builder $donorQuery) use ($term): void {
                            $this->whereAnyLike($donorQuery, ['name', 'email'], $term);
                        });

                        $query->orWhereHas('beneficiary', function (Builder $beneficiaryQuery) use ($term): void {
                            $this->whereAnyLike($beneficiaryQuery, ['first_name', 'last_name', 'internal_id'], $term);
                        });
                    })
                    ->latest()
                    ->limit($limit)
                    ->get()
                    ->map(fn (Sponsorship $sponsorship): array => [
                        'id' => $sponsorship->uuid,
                        'reference' => $sponsorship->sponsorship_reference,
                        'title' => $this->joinSummary([
                            $sponsorship->donor?->name,
                            $sponsorship->beneficiary
                                ? trim($sponsorship->beneficiary->first_name.' '.$sponsorship->beneficiary->last_name)
                                : null,
                        ]),
                        'subtitle' => $this->joinSummary([
                            $this->moneyLabel($sponsorship->pledged_amount, $sponsorship->currency),
                            $this->localizedLabel('sponsorship_statuses', $sponsorship->status),
                            $this->localizedLabel('sponsorship_types', $sponsorship->type),
                        ]),
                        'status' => $sponsorship->status,
                        'status_label' => $this->localizedLabel('sponsorship_statuses', $sponsorship->status),
                    ]),
            ],
        ];
    }

    private function whereAnyLike(Builder $query, array $columns, string $term): void
    {
        foreach ($columns as $index => $column) {
            $method = $index === 0 ? 'where' : 'orWhere';
            $query->{$method}($column, 'like', '%'.$term.'%');
        }
    }

    private function joinSummary(array $parts): ?string
    {
        $parts = array_values(array_filter($parts, fn ($part): bool => filled($part)));

        if ($parts === []) {
            return null;
        }

        return implode(' • ', $parts);
    }

    private function moneyLabel(mixed $amount, ?string $currency): ?string
    {
        if ($amount === null) {
            return null;
        }

        $normalized = number_format((float) $amount, 0, '.', ',');

        return trim($normalized.' '.($currency ?? ''));
    }
}
