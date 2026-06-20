<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DashboardSummaryService;
use Illuminate\Http\Request;

class DashboardSummaryController extends Controller
{
    public function __invoke(Request $request, DashboardSummaryService $summaryService)
    {
        return $this->success(
            $summaryService->build($request->user()),
            __('api.dashboard.retrieved'),
        );
    }
}
