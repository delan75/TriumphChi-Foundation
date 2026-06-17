<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchoolRequest;
use App\Http\Resources\SchoolResource;
use App\Models\School;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    public function index(Request $request)
    {
        return SchoolResource::collection(School::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreSchoolRequest $request)
    {
        return SchoolResource::make(School::create($request->validated()));
    }

    public function show(School $school)
    {
        return SchoolResource::make($school);
    }

    public function update(StoreSchoolRequest $request, School $school)
    {
        $school->update($request->validated());

        return SchoolResource::make($school);
    }

    public function destroy(School $school)
    {
        $school->delete();

        return response()->noContent();
    }
}

