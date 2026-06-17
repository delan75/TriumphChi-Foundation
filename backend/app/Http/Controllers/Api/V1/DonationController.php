<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDonationRequest;
use App\Http\Resources\DonationResource;
use App\Models\Donation;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function index(Request $request)
    {
        return DonationResource::collection(Donation::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreDonationRequest $request)
    {
        return DonationResource::make(Donation::create($request->validated()));
    }

    public function show(Donation $donation)
    {
        return DonationResource::make($donation);
    }

    public function update(StoreDonationRequest $request, Donation $donation)
    {
        $donation->update($request->validated());

        return DonationResource::make($donation);
    }

    public function destroy(Donation $donation)
    {
        $donation->delete();

        return response()->noContent();
    }
}

