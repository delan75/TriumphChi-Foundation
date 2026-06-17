<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EducationalNeedResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        $status = $this->normalizedLabelValue($this->status);

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
            'status' => $status,
            'status_label' => $this->localizedLabel('need_statuses', $status),
            'funding_starts_at' => $this->funding_starts_at,
            'funding_ends_at' => $this->funding_ends_at,
        ];
    }
}
