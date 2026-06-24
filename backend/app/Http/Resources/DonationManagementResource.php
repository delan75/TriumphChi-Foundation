<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonationManagementResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        $status = $this->normalizedLabelValue($this->status);
        $allocatedAmount = (float) ($this->allocated_amount ?? $this->allocations->sum('amount'));
        $amount = (float) $this->amount;
        $canViewBeneficiaries = $request->user()?->can('beneficiaries.view') ?? false;

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'reference_number' => $this->reference_number,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'method' => $this->method,
            'method_label' => $this->localizedLabel('payment_methods', $this->method),
            'provider' => $this->provider,
            'provider_reference' => $this->provider_reference,
            'status' => $status,
            'status_label' => $this->localizedLabel('donation_statuses', $status),
            'donated_at' => $this->donated_at,
            'confirmed_at' => $this->confirmed_at,
            'receipt_available' => filled($this->receipt_path)
                || ((int) ($this->documents_count ?? 0) > 0)
                || ($this->relationLoaded('documents') && $this->documents->contains('type', 'receipt')),
            'notes' => $this->notes,
            'donor' => $this->whenLoaded('donor', fn () => [
                'id' => $this->donor?->id,
                'uuid' => $this->donor?->uuid,
                'name' => $this->donor?->name,
                'email' => $this->donor?->email,
                'type' => $this->donor?->type,
                'type_label' => $this->localizedLabel('donor_types', $this->donor?->type),
                'status' => $this->donor?->status,
            ]),
            'fund' => $this->whenLoaded('fund', fn () => [
                'id' => $this->fund?->id,
                'uuid' => $this->fund?->uuid,
                'code' => $this->fund?->code,
                'name' => $this->fund?->name,
                'currency' => $this->fund?->currency,
                'status' => $this->fund?->status,
            ]),
            'allocation_summary' => [
                'count' => (int) ($this->allocations_count ?? $this->allocations->count()),
                'allocated_amount' => number_format($allocatedAmount, 2, '.', ''),
                'unallocated_amount' => number_format(max($amount - $allocatedAmount, 0), 2, '.', ''),
                'currency' => $this->currency,
            ],
            'payment_summary' => [
                'intents_count' => (int) ($this->payment_intents_count ?? $this->paymentIntents->count()),
                'transactions_count' => (int) ($this->payment_transactions_count ?? $this->paymentTransactions->count()),
                'latest_intent' => $this->whenLoaded('paymentIntents', fn () => $this->latestIntentPayload()),
                'latest_transaction' => $this->whenLoaded('paymentTransactions', fn () => $this->latestTransactionPayload()),
            ],
            'allocations' => $this->whenLoaded('allocations', fn () => $this->allocations->map(fn ($allocation) => [
                'id' => $allocation->id,
                'uuid' => $allocation->uuid,
                'allocation_reference' => $allocation->allocation_reference,
                'amount' => $allocation->amount,
                'currency' => $allocation->currency,
                'status' => $allocation->status,
                'status_label' => $this->localizedLabel('allocation_statuses', $allocation->status),
                'allocated_at' => $allocation->allocated_at,
                'educational_need' => $allocation->relationLoaded('educationalNeed') && $allocation->educationalNeed ? [
                    'id' => $allocation->educationalNeed->id,
                    'uuid' => $allocation->educationalNeed->uuid,
                    'type' => $allocation->educationalNeed->type,
                    'title' => $allocation->educationalNeed->title,
                    'beneficiary' => $canViewBeneficiaries && $allocation->educationalNeed->relationLoaded('beneficiary') && $allocation->educationalNeed->beneficiary ? [
                        'uuid' => $allocation->educationalNeed->beneficiary->uuid,
                        'internal_id' => $allocation->educationalNeed->beneficiary->internal_id,
                        'display_name' => trim($allocation->educationalNeed->beneficiary->first_name.' '.$allocation->educationalNeed->beneficiary->last_name),
                    ] : null,
                ] : null,
            ])->values()),
            'transactions' => $this->whenLoaded('paymentTransactions', fn () => $this->paymentTransactions->map(fn ($transaction) => [
                'uuid' => $transaction->uuid,
                'transaction_reference' => $transaction->transaction_reference,
                'provider_transaction_id' => $transaction->provider_transaction_id,
                'type' => $transaction->type,
                'status' => $transaction->status,
                'amount' => $transaction->amount,
                'currency' => $transaction->currency,
                'processed_at' => $transaction->processed_at,
                'provider' => $transaction->provider?->key,
            ])->values()),
            'documents' => $this->whenLoaded('documents', fn () => DonationDocumentResource::collection($this->documents)),
            'permissions' => [
                'can_view' => $request->user()?->can('donations.view') ?? false,
                'can_create' => $request->user()?->can('donations.create') ?? false,
                'can_update' => $request->user()?->can('donations.update') ?? false,
                'can_approve' => $request->user()?->can('donations.approve') ?? false,
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function latestIntentPayload(): ?array
    {
        $intent = $this->paymentIntents->sortByDesc('created_at')->first();

        return $intent ? [
            'uuid' => $intent->uuid,
            'intent_reference' => $intent->intent_reference,
            'provider' => $intent->provider?->key,
            'status' => $intent->status,
            'amount' => $intent->amount,
            'currency' => $intent->currency,
            'expires_at' => $intent->expires_at,
        ] : null;
    }

    private function latestTransactionPayload(): ?array
    {
        $transaction = $this->paymentTransactions->sortByDesc('processed_at')->first();

        return $transaction ? [
            'uuid' => $transaction->uuid,
            'transaction_reference' => $transaction->transaction_reference,
            'provider' => $transaction->provider?->key,
            'type' => $transaction->type,
            'status' => $transaction->status,
            'amount' => $transaction->amount,
            'currency' => $transaction->currency,
            'processed_at' => $transaction->processed_at,
        ] : null;
    }
}
