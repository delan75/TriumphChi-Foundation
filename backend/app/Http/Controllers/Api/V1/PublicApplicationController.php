<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublicApplicationRequest;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PublicApplicationController extends Controller
{
    public function store(StorePublicApplicationRequest $request): JsonResponse
    {
        $application = DB::transaction(function () use ($request): Application {
            $application = Application::create([
                'source' => 'online',
                'status' => ApplicationStatus::Submitted,
                'applicant_name' => $request->string('child_name')->toString(),
                'gender' => $request->filled('gender') ? $request->string('gender')->toString() : null,
                'date_of_birth' => $request->filled('date_of_birth') ? $request->date('date_of_birth') : null,
                'guardian_name' => $request->string('contact_name')->toString(),
                'guardian_phone' => $request->string('contact_phone')->toString(),
                'needs_assessment' => $this->summarizeNeed($request),
                'intake_payload' => $this->buildIntakePayload($request),
                'submitted_at' => now(),
            ]);

            $application->statusHistory()->create([
                'from_status' => null,
                'to_status' => ApplicationStatus::Submitted->value,
                'changed_by' => null,
                'changed_at' => now(),
                'reason' => 'public_submission',
                'notes' => 'Public application submitted.',
                'ip_address' => $request->ip(),
            ]);

            return $application;
        });

        return $this->created([
            'uuid' => $application->uuid,
            'application_number' => $application->application_number,
            'submitted_at' => $application->submitted_at?->toISOString(),
        ], __('api.application.received'));
    }

    private function summarizeNeed(StorePublicApplicationRequest $request): string
    {
        return trim(implode("\n\n", array_filter([
            'Need type: '.$request->string('need_type')->toString(),
            'Need summary: '.$request->string('need_summary')->toString(),
            'Situation summary: '.$request->string('situation_summary')->toString(),
        ])));
    }

    private function buildIntakePayload(StorePublicApplicationRequest $request): array
    {
        return [
            'child_name' => $request->string('child_name')->toString(),
            'gender' => $request->filled('gender') ? $request->string('gender')->toString() : null,
            'date_of_birth' => $request->filled('date_of_birth') ? $request->date('date_of_birth')?->toDateString() : null,
            'school_name' => $request->filled('school_name') ? $request->string('school_name')->toString() : null,
            'grade_level' => $request->filled('grade_level') ? $request->string('grade_level')->toString() : null,
            'region_name' => $request->filled('region_name') ? $request->string('region_name')->toString() : null,
            'village_name' => $request->filled('village_name') ? $request->string('village_name')->toString() : null,
            'need_type' => $request->string('need_type')->toString(),
            'need_summary' => $request->string('need_summary')->toString(),
            'situation_summary' => $request->string('situation_summary')->toString(),
            'contact_role' => $request->string('contact_role')->toString(),
            'contact_name' => $request->string('contact_name')->toString(),
            'contact_phone' => $request->string('contact_phone')->toString(),
            'contact_email' => $request->filled('contact_email') ? $request->string('contact_email')->toString() : null,
            'preferred_contact_method' => $request->string('preferred_contact_method')->toString(),
            'consent' => true,
            'locale' => app()->getLocale(),
        ];
    }
}
