<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BeneficiaryResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        $status = $this->normalizedLabelValue($this->status);

        return [
            'id' => $this->id,
            'internal_id' => $this->internal_id,
            'status' => $status,
            'status_label' => $this->localizedLabel('beneficiary_statuses', $status),
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'date_of_birth' => $this->date_of_birth,
            'guardian_name' => $this->guardian_name,
            'guardian_phone' => $this->guardian_phone,
            'region' => $this->region,
            'village' => $this->village,
            'education_level' => $this->education_level,
            'funding_progress' => $this->funding_progress,
            'school' => SchoolResource::make($this->whenLoaded('school')),
            'needs' => EducationalNeedResource::collection($this->whenLoaded('needs')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
