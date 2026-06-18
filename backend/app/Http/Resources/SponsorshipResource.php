<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SponsorshipResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'sponsorship_reference' => $this->sponsorship_reference,
            'donor_id' => $this->donor_id,
            'beneficiary_id' => $this->beneficiary_id,
            'fund_id' => $this->fund_id,
            'type' => $this->type,
            'type_label' => $this->localizedLabel('sponsorship_types', $this->type),
            'pledged_amount' => $this->pledged_amount,
            'currency' => $this->currency,
            'billing_frequency' => $this->billing_frequency,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'status' => $this->status,
            'status_label' => $this->localizedLabel('sponsorship_statuses', $this->status),
            'notes' => $this->notes,
        ];
    }
}
