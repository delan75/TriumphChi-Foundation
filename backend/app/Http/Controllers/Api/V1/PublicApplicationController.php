<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationStep;
use App\Models\ApplicationDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\LaravelPdf\Facades\Pdf;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\Api\V1\StorePublicApplicationRequest;

class PublicApplicationController extends Controller
{
    public function initDraft(Request $request): JsonResponse
    {
        $application = Application::create([
            'source' => 'online',
            'status' => ApplicationStatus::Draft,
            'draft_token' => Str::random(40),
            'current_step' => 1,
            'applicant_name' => 'Draft Application', // Placeholder until filled
            'submitted_by' => auth('sanctum')->id(),
        ]);

        return $this->ok([
            'draft_token' => $application->draft_token,
            'application_number' => $application->application_number,
        ]);
    }

    public function saveStep(Request $request, string $token, int $step): JsonResponse
    {
        $application = $this->findDraftByToken($token);

        if (!$application) {
            return $this->error('Application not found or already submitted.', 404);
        }

        DB::transaction(function () use ($application, $step, $request) {
            ApplicationStep::updateOrCreate(
                ['application_id' => $application->id, 'step_number' => $step],
                [
                    'data' => $request->all(),
                    'completed_at' => now(),
                ]
            );

            $application->update(['current_step' => max($application->current_step, $step + 1)]);
        });

        return $this->ok(['message' => 'Step saved successfully.']);
    }

    public function uploadDocument(Request $request, string $token): JsonResponse
    {
        $application = $this->findDraftByToken($token);

        if (!$application) {
            return $this->error('Application not found or already submitted.', 404);
        }

        $request->validate([
            'document_type' => 'required|string',
            'file' => 'required|file|max:10240', // 10MB
        ]);

        $file = $request->file('file');
        $path = $file->store('applications/documents');

        $document = ApplicationDocument::create([
            'application_id' => $application->id,
            'document_type' => $request->input('document_type'),
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
        ]);

        return $this->ok([
            'message' => 'Document uploaded successfully.',
            'document_id' => $document->id,
        ]);
    }

    public function submit(Request $request, string $token): JsonResponse
    {
        $application = $this->findDraftByToken($token);

        if (!$application) {
            return $this->error('Application not found.', 404);
        }

        // Parse steps and consolidate to relational tables
        $steps = $application->steps()->orderBy('step_number')->get()->keyBy('step_number');
        $allData = [];
        foreach ($steps as $step) {
            $allData = array_merge($allData, $step->data);
        }

        DB::transaction(function () use ($application, $allData, $request) {
            // Update Application
            $application->update([
                'status' => ApplicationStatus::Submitted,
                'applicant_name' => $allData['child_name'] ?? 'Unknown',
                'gender' => $allData['gender'] ?? null,
                'date_of_birth' => isset($allData['date_of_birth']) ? \Carbon\Carbon::parse($allData['date_of_birth']) : null,
                'guardian_name' => $allData['contact_name'] ?? null,
                'guardian_phone' => $allData['contact_phone'] ?? null,
                'submitted_at' => now(),
                'household_income_range' => $allData['household_income_range'] ?? null,
                'household_size' => $allData['household_size'] ?? null,
                'primary_caregiver_occupation' => $allData['primary_caregiver_occupation'] ?? null,
                'household_challenges' => $allData['household_challenges'] ?? null,
                'needs_assessment' => $allData['need_summary'] ?? null,
                'intake_payload' => $allData, // Keep full payload as fallback
            ]);

            // Save Verification Contacts
            if (!empty($allData['contact_name'])) {
                $application->verificationContacts()->create([
                    'name' => $allData['contact_name'],
                    'role' => $allData['contact_role'] ?? 'guardian',
                    'phone' => $allData['contact_phone'] ?? null,
                    'email' => $allData['contact_email'] ?? null,
                ]);
            }

            // Save Education Details
            $application->educationDetails()->create([
                'is_currently_enrolled' => $allData['is_enrolled'] ?? false,
                'school_name' => $allData['school_name'] ?? null,
                'grade_level' => $allData['grade_level'] ?? null,
                'distance_to_school' => $allData['distance_to_school'] ?? null,
                'interruption_reasons' => $allData['interruption_reasons'] ?? null,
            ]);

            // Save Need Assessment
            if (!empty($allData['need_type'])) {
                $application->needAssessments()->create([
                    'need_type' => $allData['need_type'],
                    'description' => $allData['need_summary'] ?? null,
                ]);
            }

            $application->statusHistory()->create([
                'from_status' => ApplicationStatus::Draft->value,
                'to_status' => ApplicationStatus::Submitted->value,
                'changed_by' => auth('sanctum')->id(),
                'changed_at' => now(),
                'reason' => 'public_submission',
                'notes' => 'Public application submitted.',
                'ip_address' => $request->ip(),
            ]);
        });

        return $this->created([
            'uuid' => $application->uuid,
            'application_number' => $application->application_number,
            'submitted_at' => $application->submitted_at?->toISOString(),
        ], __('api.application.received'));
    }

    public function generatePdf(Request $request, string $token)
    {
        // Allow generating PDF for both Draft (Preview) and Submitted forms.
        $application = Application::where('draft_token', $token)
            ->orWhere('application_number', $token)
            ->first();

        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        $steps = $application->steps()->orderBy('step_number')->get()->keyBy('step_number');
        $data = [];
        foreach ($steps as $step) {
            $data = array_merge($data, $step->data);
        }
        
        // Use monolithic payload if step data is empty (legacy backward compat)
        if (empty($data) && $application->intake_payload) {
            $data = $application->intake_payload;
        }

        $pdf = Pdf::view('pdf.application_summary', [
            'application' => $application,
            'data' => $data
        ])
        ->format('A4')
        ->name('Application_' . $application->application_number . '.pdf');

        return $pdf;
    }

    public function previewPdf(Request $request)
    {
        $data = $request->all();
        
        // Create a dummy application for the view
        $application = new Application([
            'application_number' => 'DRAFT-PREVIEW',
            'submitted_at' => null,
        ]);

        $pdf = Pdf::view('pdf.application_summary', [
            'application' => $application,
            'data' => $data
        ])
        ->format('A4')
        ->name('Application_Preview.pdf');

        return $pdf;
    }

    private function findDraftByToken(string $token): ?Application
    {
        $query = Application::where('draft_token', $token);
        
        // If the user is authenticated, we can optionally scope this to their ID if needed,
        // but for now the token itself acts as a capability URL.
        
        return $query->whereIn('status', [ApplicationStatus::Draft, ApplicationStatus::Submitted])->first();
    }
    
    // Legacy store method to prevent breaking existing front-end entirely if needed during transition
    public function store(StorePublicApplicationRequest $request): JsonResponse
    {
        // For backwards compatibility or direct monolithic submission
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
