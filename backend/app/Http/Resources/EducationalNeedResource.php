<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EducationalNeedResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'beneficiary_id' => $this->beneficiary_id,
            'title' => $this->title,
            'description' => $this->description,
            'amount_required' => $this->amount_required,
            'amount_funded' => $this->amount_funded,
            'funding_percentage' => $this->amount_required > 0
                ? round(((float) $this->amount_funded / (float) $this->amount_required) * 100, 2)
                : 0,
            'status' => $this->status?->value,
            'funding_starts_at' => $this->funding_starts_at,
            'funding_ends_at' => $this->funding_ends_at,
        ];
    }
}
