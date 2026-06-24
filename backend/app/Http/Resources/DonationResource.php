<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonationResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        $status = $this->normalizedLabelValue($this->status);

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'reference_number' => $this->reference_number,
            'idempotency_key' => $this->idempotency_key,
            'donor_id' => $this->donor_id,
            'fund_id' => $this->fund_id,
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
            'receipt_path' => $this->receipt_path,
            'documents' => $this->whenLoaded('documents', fn () => DonationDocumentResource::collection($this->documents)),
            'metadata' => $this->metadata,
            'notes' => $this->notes,
        ];
    }
}
