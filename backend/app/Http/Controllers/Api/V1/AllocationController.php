<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAllocationRequest;
use App\Http\Resources\AllocationResource;
use App\Models\Allocation;
use App\Services\FundingTransactionService;
use Illuminate\Http\Request;

class AllocationController extends Controller
{
    public function index(Request $request)
    {
        return AllocationResource::collection(Allocation::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreAllocationRequest $request, FundingTransactionService $funding)
    {
        return AllocationResource::make($funding->createAllocation($request->validated(), $request->user()));
    }

    public function show(Allocation $allocation)
    {
        return AllocationResource::make($allocation);
    }
}
