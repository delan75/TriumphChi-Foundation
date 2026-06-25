<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\TransitionApplicationStatusRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Services\ApplicationBeneficiaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelPdf\Facades\Pdf;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Application::class);

        $query = Application::query()
            ->with(['region', 'village', 'school.region', 'school.village'])
            ->latest();

        // Status filter: accepts comma-separated values, e.g. ?status=submitted,verification_pending
        if ($request->filled('status')) {
            $statuses = array_filter(array_map('trim', explode(',', $request->string('status'))));
            $query->whereIn('status', $statuses);
        }

        // Free-text search: application_number or applicant_name
        if ($request->filled('search')) {
            $term = '%'.trim($request->string('search')).'%';
            $query->where(function ($q) use ($term) {
                $q->where('application_number', 'like', $term)
                  ->orWhere('applicant_name', 'like', $term)
                  ->orWhere('guardian_name', 'like', $term);
            });
        }

        // Source filter
        if ($request->filled('source')) {
            $query->where('source', $request->string('source'));
        }

        $applications = $query->paginate($request->integer('per_page', 20));

        return $this->paginated($applications, __('api.applications.retrieved'), ApplicationResource::class);
    }

    public function store(StoreApplicationRequest $request)
    {
        $application = Application::create($request->validated());

        return $this->created(
            ApplicationResource::make($application->load(['region', 'village', 'school.region', 'school.village'])),
            __('api.applications.created')
        );
    }

    public function show(Application $application)
    {
        $this->authorize('view', $application);

        return $this->success(
            ApplicationResource::make($application->load(['region', 'village', 'school.region', 'school.village'])),
            __('api.applications.retrieved_single')
        );
    }

    public function pdf(Application $application)
    {
        $this->authorize('view', $application);

        $application->loadMissing(['region', 'village', 'school', 'steps']);

        return Pdf::view('pdf.application_summary', [
            'application' => $application,
            'data' => $this->buildPdfData($application),
            'generatedAt' => now(),
            'isPreview' => false,
        ])
            ->format('A4')
            ->margins(10, 10, 12, 10)
            ->name('Application_' . $application->application_number . '.pdf');
    }

    public function update(StoreApplicationRequest $request, Application $application)
    {
        $this->authorize('update', $application);

        $application->update($request->validated());

        return $this->updated(
            ApplicationResource::make($application->load(['region', 'village', 'school.region', 'school.village'])),
            __('api.applications.updated')
        );
    }

    public function destroy(Application $application)
    {
        $this->authorize('delete', $application);

        $application->delete();

        return $this->deleted(__('api.applications.deleted'));
    }

    public function transition(
        TransitionApplicationStatusRequest $request,
        Application $application,
        ApplicationBeneficiaryService $beneficiaries
    )
    {
        $this->authorize('transition', $application);

        $next = ApplicationStatus::from($request->validated('status'));
        abort_unless($application->status->canTransitionTo($next), 422, __('api.applications.invalid_transition'));
        $previous = $application->status;

        DB::transaction(function () use ($application, $beneficiaries, $next, $previous, $request): void {
            $application->update([
                'status' => $next,
                'verification_notes' => $request->validated('notes') ?? $application->verification_notes,
                'submitted_at' => $next === ApplicationStatus::Submitted ? now() : $application->submitted_at,
                'verified_at' => $next === ApplicationStatus::Verified ? now() : $application->verified_at,
                'reviewed_at' => in_array($next, [ApplicationStatus::Accepted, ApplicationStatus::Rejected], true)
                    ? now()
                    : $application->reviewed_at,
            ]);

            $application->statusHistory()->create([
                'from_status' => $previous->value,
                'to_status' => $next->value,
                'changed_by' => $request->user()?->id,
                'changed_at' => now(),
                'notes' => $request->validated('notes'),
                'ip_address' => $request->ip(),
            ]);

            if ($next === ApplicationStatus::Accepted) {
                $beneficiaries->createFromAcceptedApplication(
                    $application,
                    $request->user()?->id,
                    $request->ip(),
                    $request->validated('notes')
                );
            }
        });

        return $this->success(
            ApplicationResource::make($application->fresh(['region', 'village', 'school.region', 'school.village', 'beneficiary'])),
            __('api.applications.transitioned')
        );
    }

    private function buildPdfData(Application $application): array
    {
        $recordData = array_filter([
            'child_name' => $application->applicant_name,
            'gender' => $application->gender,
            'date_of_birth' => $application->date_of_birth?->toDateString(),
            'region_name' => $application->region?->name,
            'village_name' => $application->village?->name,
            'school_name' => $application->school?->name,
            'need_summary' => $application->needs_assessment,
            'household_income_range' => $application->household_income_range,
            'household_size' => $application->household_size,
            'primary_caregiver_occupation' => $application->primary_caregiver_occupation,
            'household_challenges' => $application->household_challenges,
            'contact_name' => $application->guardian_name,
            'contact_phone' => $application->guardian_phone,
        ], fn ($value) => $value !== null && $value !== '');

        $stepData = [];
        foreach ($application->steps()->orderBy('step_number')->get() as $step) {
            $stepData = array_merge($stepData, $step->data ?? []);
        }

        return array_merge($recordData, $application->intake_payload ?? [], $stepData);
    }
}
