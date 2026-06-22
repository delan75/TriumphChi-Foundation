<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\GlobalSearchRequest;
use App\Services\GlobalSearchService;

class GlobalSearchController extends Controller
{
    public function __invoke(GlobalSearchRequest $request, GlobalSearchService $searchService)
    {
        return $this->success(
            $searchService->search(
                $request->user(),
                $request->validated('q'),
                $request->integer('limit', 8),
            ),
            __('api.search.retrieved'),
        );
    }
}
