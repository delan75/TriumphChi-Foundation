<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PublicApplicationIntakeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicLookupController extends Controller
{
    public function __construct(private readonly PublicApplicationIntakeService $intakeService)
    {
    }

    public function index(Request $request, string $type): JsonResponse
    {
        abort_unless(in_array($type, ['regions', 'villages', 'schools'], true), 404);

        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'region_name' => ['nullable', 'string', 'max:255'],
            'village_name' => ['nullable', 'string', 'max:255'],
        ]);

        $results = $this->intakeService->suggest(
            $type,
            $validated['q'] ?? null,
            $validated['region_name'] ?? null,
            $validated['village_name'] ?? null,
        );

        return $this->success([
            'type' => $type,
            'results' => $results,
            'count' => count($results),
        ], __('api.lookup.suggestions'));
    }
}
