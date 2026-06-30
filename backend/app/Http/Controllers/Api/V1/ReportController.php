<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Reports\ReportCatalogService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller
{
    public function dashboard(Request $request, ReportCatalogService $reports)
    {
        return $this->success(
            $reports->dashboard($request->user()),
            __('api.reports.dashboard_retrieved'),
        );
    }

    public function queue(Request $request, ReportCatalogService $reports)
    {
        return $this->success(
            $reports->queueFor($request->user())->values()->all(),
            __('api.reports.queue_retrieved'),
        );
    }

    public function generate(Request $request, ReportCatalogService $reports)
    {
        $payload = $request->validate([
            'template_key' => ['required', 'string', 'max:120'],
            'format' => ['required', 'string', 'max:20'],
            'filters' => ['sometimes', 'array'],
            'filters.region_id' => ['nullable', 'string', 'max:30'],
            'filters.school_id' => ['nullable', 'string', 'max:30'],
            'filters.academic_year' => ['nullable', 'string', 'max:30'],
            'filters.support_status' => ['nullable', 'string', 'max:60'],
            'filters.funding_status' => ['nullable', 'string', 'max:60'],
            'fields' => ['sometimes', 'array'],
            'fields.*' => ['string', 'max:80'],
            'source' => ['sometimes', 'string', 'max:80'],
        ]);

        try {
            $reportRequest = $reports->createRequest($request->user(), $payload);
        } catch (ValidationException $exception) {
            return $this->validationError(
                $exception->errors(),
                __('api.reports.request_invalid'),
            );
        }

        return $this->created(
            $reports->requestPayload($reportRequest),
            __('api.reports.request_queued'),
        );
    }
}
