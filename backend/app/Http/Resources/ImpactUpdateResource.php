<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImpactUpdateResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'beneficiary_id' => $this->beneficiary_id,
            'title' => $this->title,
            'body' => $this->body,
            'visibility' => $this->visibility,
            'visibility_label' => $this->localizedLabel('impact_visibility', $this->visibility),
            'published_at' => $this->published_at,
        ];
    }
}
