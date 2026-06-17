<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAllocationRequest;
use App\Http\Resources\AllocationResource;
use App\Models\Allocation;
use Illuminate\Http\Request;

class AllocationController extends Controller
{
    public function index(Request $request)
    {
        return AllocationResource::collection(Allocation::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreAllocationRequest $request)
    {
        return AllocationResource::make(Allocation::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]));
    }

    public function show(Allocation $allocation)
    {
        return AllocationResource::make($allocation);
    }
}

