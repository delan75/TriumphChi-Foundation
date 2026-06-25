<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BeneficiaryResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        $status = $this->normalizedLabelValue($this->status);
        $displayName = trim($this->first_name.' '.$this->last_name);
        $needs = $this->relationLoaded('needs') ? $this->needs : collect();
        $payments = $this->relationLoaded('payments') ? $this->payments : collect();
        $sponsorships = $this->relationLoaded('sponsorships') ? $this->sponsorships : collect();
        $impactUpdates = $this->relationLoaded('impactUpdates') ? $this->impactUpdates : collect();
        $needsRequired = (float) ($this->needs_amount_required_sum ?? $needs->sum('amount_required'));
        $needsFunded = (float) ($this->needs_amount_funded_sum ?? $needs->sum('amount_funded'));
        $fundingGap = max($needsRequired - $needsFunded, 0);
        $paymentsTotal = (float) ($this->payments_amount_sum ?? $payments->sum('amount'));
        $canViewFunding = ($request->user()?->can('donations.view') ?? false)
            || ($request->user()?->can('funds.view') ?? false)
            || ($request->user()?->can('payments.view') ?? false);

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'internal_id' => $this->internal_id,
            'display_name' => $displayName,
            'status' => $status,
            'status_label' => $this->localizedLabel('beneficiary_statuses', $status),
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth,
            'age' => $this->date_of_birth ? (int) $this->date_of_birth->age : null,
            'guardian_name' => $this->guardian_name,
            'guardian_phone' => $this->guardian_phone,
            'region' => RegionResource::make($this->whenLoaded('region')),
            'village' => VillageResource::make($this->whenLoaded('village')),
            'education_level' => $this->education_level,
            'admission_date' => $this->admission_date,
            'graduation_date' => $this->graduation_date,
            'funding_progress' => $this->funding_progress,
            'application' => ApplicationResource::make($this->whenLoaded('application')),
            'school' => SchoolResource::make($this->whenLoaded('school')),
            'needs' => EducationalNeedResource::collection($this->whenLoaded('needs')),
            'case_summary' => [
                'needs_count' => (int) ($this->needs_count ?? $needs->count()),
                'sponsor_count' => (int) ($this->sponsorships_count ?? $sponsorships->count()),
                'payments_count' => (int) ($this->payments_count ?? $payments->count()),
                'impact_updates_count' => (int) ($this->impact_updates_count ?? $impactUpdates->count()),
                'latest_update_at' => optional(collect([
                    $this->updated_at,
                    $needs->max('updated_at'),
                    $payments->max('updated_at'),
                    $impactUpdates->max('updated_at'),
                ])->filter()->max())->toISOString(),
            ],
            'funding_summary' => [
                'amount_required' => number_format($needsRequired, 2, '.', ''),
                'amount_funded' => number_format($needsFunded, 2, '.', ''),
                'funding_gap' => number_format($fundingGap, 2, '.', ''),
                'payments_total' => number_format($paymentsTotal, 2, '.', ''),
                'currency' => $needs->first()?->allocations?->first()?->currency
                    ?? $payments->first()?->currency
                    ?? 'XAF',
                'funding_percentage' => $needsRequired > 0 ? round(($needsFunded / $needsRequired) * 100, 2) : (float) $this->funding_progress,
                'has_funding_gap' => $fundingGap > 0,
            ],
            'sponsorships' => $this->when($canViewFunding && $this->relationLoaded('sponsorships'), fn () => $this->sponsorships->map(fn ($sponsorship) => [
                'uuid' => $sponsorship->uuid,
                'reference' => $sponsorship->sponsorship_reference,
                'type' => $sponsorship->type,
                'status' => $sponsorship->status,
                'status_label' => $this->localizedLabel('sponsorship_statuses', $sponsorship->status),
                'pledged_amount' => $sponsorship->pledged_amount,
                'currency' => $sponsorship->currency,
                'billing_frequency' => $sponsorship->billing_frequency,
                'starts_at' => $sponsorship->starts_at,
                'ends_at' => $sponsorship->ends_at,
                'donor' => $sponsorship->donor ? [
                    'uuid' => $sponsorship->donor->uuid,
                    'name' => $sponsorship->donor->name,
                    'email' => $sponsorship->donor->email,
                ] : null,
            ])->values()),
            'payments' => $this->when($canViewFunding && $this->relationLoaded('payments'), fn () => $this->payments->map(fn ($payment) => [
                'uuid' => $payment->uuid,
                'reference' => $payment->payment_reference,
                'payee_name' => $payment->payee_name,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'method' => $payment->method,
                'status' => $payment->status,
                'status_label' => $this->localizedLabel('payment_statuses', $payment->status),
                'payment_date' => $payment->payment_date,
                'fund' => $payment->fund ? [
                    'uuid' => $payment->fund->uuid,
                    'name' => $payment->fund->name,
                    'code' => $payment->fund->code,
                ] : null,
            ])->values()),
            'support_history' => $this->when($this->relationLoaded('statusHistory') || $this->relationLoaded('impactUpdates') || $this->relationLoaded('payments'), fn () => $this->supportHistory()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'permissions' => [
                'can_view' => $request->user()?->can('beneficiaries.view') ?? false,
                'can_create' => $request->user()?->can('beneficiaries.create') ?? false,
                'can_update' => $request->user()?->can('beneficiaries.update') ?? false,
                'can_delete' => $request->user()?->can('beneficiaries.delete') ?? false,
                'can_view_funding' => $canViewFunding,
                'can_record_payments' => $request->user()?->can('payments.create') ?? false,
                'can_publish_updates' => $request->user()?->can('impact_updates.publish') ?? false,
            ],
        ];
    }

    private function supportHistory()
    {
        $history = collect();

        if ($this->relationLoaded('statusHistory')) {
            $history = $history->concat($this->statusHistory->map(fn ($entry) => [
                'type' => 'status_change',
                'title' => $this->localizedLabel('beneficiary_statuses', $entry->to_status),
                'description' => $entry->notes ?: $entry->reason,
                'happened_at' => $entry->changed_at,
                'actor' => $entry->actor?->name,
            ]));
        }

        if ($this->relationLoaded('payments')) {
            $history = $history->concat($this->payments->map(fn ($payment) => [
                'type' => 'payment',
                'title' => $payment->payment_reference,
                'description' => trim(($payment->payee_name ?: 'Payment').' '.$payment->amount.' '.$payment->currency),
                'happened_at' => $payment->payment_date,
                'actor' => null,
            ]));
        }

        if ($this->relationLoaded('impactUpdates')) {
            $history = $history->concat($this->impactUpdates->map(fn ($update) => [
                'type' => 'impact_update',
                'title' => $update->title,
                'description' => str($update->body)->limit(160)->toString(),
                'happened_at' => $update->published_at ?: $update->created_at,
                'actor' => null,
            ]));
        }

        return $history
            ->sortByDesc('happened_at')
            ->values();
    }
}
