<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEducationalNeedRequest;
use App\Http\Resources\EducationalNeedResource;
use App\Models\EducationalNeed;
use Illuminate\Http\Request;

class EducationalNeedController extends Controller
{
    public function index(Request $request)
    {
        return EducationalNeedResource::collection(EducationalNeed::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreEducationalNeedRequest $request)
    {
        return EducationalNeedResource::make(EducationalNeed::create($request->validated()));
    }

    public function show(EducationalNeed $educationalNeed)
    {
        return EducationalNeedResource::make($educationalNeed);
    }

    public function update(StoreEducationalNeedRequest $request, EducationalNeed $educationalNeed)
    {
        $educationalNeed->update($request->validated());

        return EducationalNeedResource::make($educationalNeed);
    }

    public function destroy(EducationalNeed $educationalNeed)
    {
        $educationalNeed->delete();

        return response()->noContent();
    }
}

