<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDonorRequest;
use App\Http\Resources\DonorResource;
use App\Models\Donor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonorController extends Controller
{
    public function index(Request $request)
    {
        return DonorResource::collection(Donor::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreDonorRequest $request)
    {
        return DonorResource::make(DB::transaction(fn () => Donor::create($request->validated())));
    }

    public function show(Donor $donor)
    {
        return DonorResource::make($donor);
    }

    public function update(StoreDonorRequest $request, Donor $donor)
    {
        DB::transaction(fn () => $donor->update($request->validated()));

        return DonorResource::make($donor);
    }

    public function destroy(Donor $donor)
    {
        DB::transaction(fn () => $donor->delete());

        return response()->noContent();
    }
}
