<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SchoolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'region' => $this->region,
            'village' => $this->village,
            'address' => $this->address,
            'principal_name' => $this->principal_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'verification_status' => $this->verification_status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

