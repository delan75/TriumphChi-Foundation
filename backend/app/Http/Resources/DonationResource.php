<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'donor_id' => $this->donor_id,
            'fund_id' => $this->fund_id,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'method' => $this->method,
            'status' => $this->status?->value,
            'donated_at' => $this->donated_at,
            'receipt_path' => $this->receipt_path,
            'notes' => $this->notes,
        ];
    }
}
