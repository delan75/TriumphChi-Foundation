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
            'uuid' => $this->uuid,
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
            'beneficiary' => $this->whenLoaded('beneficiary', fn () => $this->beneficiary ? [
                'uuid' => $this->beneficiary->uuid,
                'internal_id' => $this->beneficiary->internal_id,
                'display_name' => trim($this->beneficiary->first_name.' '.$this->beneficiary->last_name),
                'status' => $this->normalizedLabelValue($this->beneficiary->status),
                'status_label' => $this->localizedLabel('beneficiary_statuses', $this->normalizedLabelValue($this->beneficiary->status)),
            ] : null),
            'submitted_by' => $this->submitted_by,
            'needs_assessment' => $this->needs_assessment,
            'household_income_range' => $this->household_income_range,
            'household_size' => $this->household_size,
            'primary_caregiver_occupation' => $this->primary_caregiver_occupation,
            'household_challenges' => $this->household_challenges,
            'intake_payload' => $this->intake_payload,
            'verification_notes' => $this->verification_notes,
            'public_comment' => $this->public_comment,
            'status_history' => $this->whenLoaded('statusHistory', function () {
                return $this->statusHistory->map(function ($history) {
                    $from = $history->from_status ? $this->normalizedLabelValue($history->from_status) : null;
                    $to = $this->normalizedLabelValue($history->to_status);

                    return [
                        'id' => $history->id,
                        'from_status' => $from,
                        'from_status_label' => $from ? $this->localizedLabel('application_statuses', $from) : null,
                        'to_status' => $to,
                        'to_status_label' => $this->localizedLabel('application_statuses', $to),
                        'changed_by' => $history->actor ? [
                            'id' => $history->actor->id,
                            'name' => $history->actor->name,
                            'email' => $history->actor->email,
                        ] : null,
                        'changed_at' => $history->changed_at?->toISOString() ?? $history->created_at?->toISOString(),
                        'reason' => $history->reason,
                        'notes' => $history->notes,
                        'is_public' => (bool) $history->is_public,
                    ];
                })->values();
            }),
            'notes' => $this->whenLoaded('notes', function () {
                return $this->notes->map(function ($note) {
                    $stage = $note->stage ? $this->normalizedLabelValue($note->stage) : null;

                    return [
                        'id' => $note->id,
                        'user' => $note->author ? [
                            'id' => $note->author->id,
                            'name' => $note->author->name,
                            'email' => $note->author->email,
                        ] : null,
                        'stage' => $stage,
                        'stage_label' => $stage ? $this->localizedLabel('application_statuses', $stage) : null,
                        'note' => $note->note,
                        'is_public' => (bool) $note->is_public,
                        'created_at' => $note->created_at?->toISOString(),
                    ];
                })->values();
            }),
            'submitted_at' => $this->submitted_at,
            'verified_at' => $this->verified_at,
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
