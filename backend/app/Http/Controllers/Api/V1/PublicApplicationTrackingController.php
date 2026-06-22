<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicApplicationTrackingController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $request->validate([
            'application_number' => ['required', 'string'],
            'email' => ['required', 'email:rfc'],
        ]);

        $application = Application::where('application_number', $request->string('application_number')->toString())
            ->where('intake_payload->contact_email', $request->string('email')->toString())
            ->first();

        if (! $application) {
            return response()->json([
                'message' => __('api.application.not_found_or_unauthorized'),
            ], 404);
        }

        return response()->json([
            'message' => __('api.application.retrieved_single'),
            'data' => [
                'application_number' => $application->application_number,
                'status' => $application->status->value,
                'status_label' => __('labels.application_statuses.' . $application->status->value),
                'applicant_name' => $application->applicant_name,
                'submitted_at' => $application->submitted_at?->toISOString(),
                'reviewed_at' => $application->reviewed_at?->toISOString(),
                'verification_notes' => $application->verification_notes,
            ],
        ]);
    }
}
