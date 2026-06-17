<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\TransitionApplicationStatusRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Application::class);

        return ApplicationResource::collection(
            Application::query()
                ->with('school')
                ->latest()
                ->paginate($request->integer('per_page', 15))
        );
    }

    public function store(StoreApplicationRequest $request)
    {
        $application = Application::create($request->validated());

        return ApplicationResource::make($application->load('school'));
    }

    public function show(Application $application)
    {
        $this->authorize('view', $application);

        return ApplicationResource::make($application->load('school'));
    }

    public function update(StoreApplicationRequest $request, Application $application)
    {
        $this->authorize('update', $application);

        $application->update($request->validated());

        return ApplicationResource::make($application->load('school'));
    }

    public function destroy(Application $application)
    {
        $this->authorize('delete', $application);

        $application->delete();

        return response()->noContent();
    }

    public function transition(TransitionApplicationStatusRequest $request, Application $application)
    {
        $this->authorize('transition', $application);

        $next = ApplicationStatus::from($request->validated('status'));
        abort_unless($application->status->canTransitionTo($next), 422, 'Invalid application status transition.');

        $application->update([
            'status' => $next,
            'verification_notes' => $request->validated('notes') ?? $application->verification_notes,
            'submitted_at' => $next === ApplicationStatus::Submitted ? now() : $application->submitted_at,
            'verified_at' => $next === ApplicationStatus::Verified ? now() : $application->verified_at,
            'reviewed_at' => in_array($next, [ApplicationStatus::Accepted, ApplicationStatus::Rejected], true)
                ? now()
                : $application->reviewed_at,
        ]);

        return ApplicationResource::make($application->fresh('school'));
    }
}

