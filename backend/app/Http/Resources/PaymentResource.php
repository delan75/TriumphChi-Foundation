<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_reference' => $this->payment_reference,
            'idempotency_key' => $this->idempotency_key,
            'fund_id' => $this->fund_id,
            'school_id' => $this->school_id,
            'beneficiary_id' => $this->beneficiary_id,
            'educational_need_id' => $this->educational_need_id,
            'payee_type' => $this->payee_type,
            'payee_name' => $this->payee_name,
            'vendor_reference' => $this->vendor_reference,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'method' => $this->method,
            'method_label' => $this->localizedLabel('payment_methods', $this->method),
            'payment_date' => $this->payment_date,
            'approved_by' => $this->approved_by,
            'disbursed_by' => $this->disbursed_by,
            'proof_path' => $this->proof_path,
            'status' => $this->status,
            'status_label' => $this->localizedLabel('payment_statuses', $this->status),
            'metadata' => $this->metadata,
            'notes' => $this->notes,
        ];
    }
}
