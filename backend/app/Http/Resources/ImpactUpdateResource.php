<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImpactUpdateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'beneficiary_id' => $this->beneficiary_id,
            'title' => $this->title,
            'body' => $this->body,
            'visibility' => $this->visibility,
            'published_at' => $this->published_at,
        ];
    }
}

