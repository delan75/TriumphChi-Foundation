<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AllocationResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'allocation_reference' => $this->allocation_reference,
            'donation_id' => $this->donation_id,
            'fund_id' => $this->fund_id,
            'educational_need_id' => $this->educational_need_id,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'status_label' => $this->localizedLabel('allocation_statuses', $this->status),
            'allocated_at' => $this->allocated_at,
            'reason' => $this->reason,
            'created_by' => $this->created_by,
            'approved_by' => $this->approved_by,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
        ];
    }
}
