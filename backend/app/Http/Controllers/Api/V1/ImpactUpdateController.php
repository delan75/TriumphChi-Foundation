<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreImpactUpdateRequest;
use App\Http\Resources\ImpactUpdateResource;
use App\Models\ImpactUpdate;
use Illuminate\Http\Request;

class ImpactUpdateController extends Controller
{
    public function index(Request $request)
    {
        return ImpactUpdateResource::collection(ImpactUpdate::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreImpactUpdateRequest $request)
    {
        return ImpactUpdateResource::make(ImpactUpdate::create($request->validated()));
    }

    public function show(ImpactUpdate $impactUpdate)
    {
        return ImpactUpdateResource::make($impactUpdate);
    }

    public function update(StoreImpactUpdateRequest $request, ImpactUpdate $impactUpdate)
    {
        $impactUpdate->update($request->validated());

        return ImpactUpdateResource::make($impactUpdate);
    }

    public function destroy(ImpactUpdate $impactUpdate)
    {
        $impactUpdate->delete();

        return response()->noContent();
    }
}

