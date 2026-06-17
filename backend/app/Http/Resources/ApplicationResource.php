<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'source' => $this->source,
            'status' => $this->status?->value,
            'applicant_name' => $this->applicant_name,
            'date_of_birth' => $this->date_of_birth,
            'guardian_name' => $this->guardian_name,
            'guardian_phone' => $this->guardian_phone,
            'region' => $this->region,
            'village' => $this->village,
            'school' => SchoolResource::make($this->whenLoaded('school')),
            'needs_assessment' => $this->needs_assessment,
            'submitted_at' => $this->submitted_at,
            'verified_at' => $this->verified_at,
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
