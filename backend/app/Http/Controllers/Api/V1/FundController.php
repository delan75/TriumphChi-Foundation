<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFundRequest;
use App\Http\Resources\FundResource;
use App\Models\Fund;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FundController extends Controller
{
    public function index(Request $request)
    {
        return FundResource::collection(Fund::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreFundRequest $request)
    {
        return FundResource::make(DB::transaction(fn () => Fund::create($request->validated())));
    }

    public function show(Fund $fund)
    {
        return FundResource::make($fund);
    }

    public function update(StoreFundRequest $request, Fund $fund)
    {
        DB::transaction(fn () => $fund->update($request->validated()));

        return FundResource::make($fund);
    }

    public function destroy(Fund $fund)
    {
        DB::transaction(fn () => $fund->delete());

        return response()->noContent();
    }
}
