<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        $status = $this->normalizedLabelValue($this->status);

        return [
            'id' => $this->id,
            'source' => $this->source,
            'source_label' => $this->localizedLabel('application_sources', $this->source),
            'status' => $status,
            'status_label' => $this->localizedLabel('application_statuses', $status),
            'application_number' => $this->application_number,
            'applicant_name' => $this->applicant_name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth,
            'guardian_name' => $this->guardian_name,
            'guardian_phone' => $this->guardian_phone,
            'region' => RegionResource::make($this->whenLoaded('region')),
            'village' => VillageResource::make($this->whenLoaded('village')),
            'school' => SchoolResource::make($this->whenLoaded('school')),
            'submitted_by' => $this->submitted_by,
            'needs_assessment' => $this->needs_assessment,
            'submitted_at' => $this->submitted_at,
            'verified_at' => $this->verified_at,
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
