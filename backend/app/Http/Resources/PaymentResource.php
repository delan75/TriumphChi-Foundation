<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_reference' => $this->payment_reference,
            'school_id' => $this->school_id,
            'beneficiary_id' => $this->beneficiary_id,
            'educational_need_id' => $this->educational_need_id,
            'amount' => $this->amount,
            'payment_date' => $this->payment_date,
            'proof_path' => $this->proof_path,
            'status' => $this->status,
            'notes' => $this->notes,
        ];
    }
}

