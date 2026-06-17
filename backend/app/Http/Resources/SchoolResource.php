<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SchoolResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'region' => RegionResource::make($this->whenLoaded('region')),
            'village' => VillageResource::make($this->whenLoaded('village')),
            'address' => $this->address,
            'principal_name' => $this->principal_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'verification_status' => $this->verification_status,
            'verification_status_label' => $this->localizedLabel('school_verification_statuses', $this->verification_status),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
