<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FundResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'code' => $this->code,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'currency' => $this->currency,
            'restriction_type' => $this->restriction_type,
            'restricted_to_type' => $this->restricted_to_type,
            'restricted_to_id' => $this->restricted_to_id,
            'status' => $this->status,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'created_by' => $this->created_by,
        ];
    }
}
