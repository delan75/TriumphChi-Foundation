<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDonationRequest;
use App\Http\Resources\DonationResource;
use App\Models\Donation;
use App\Services\FundingTransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonationController extends Controller
{
    public function index(Request $request)
    {
        return DonationResource::collection(Donation::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreDonationRequest $request, FundingTransactionService $funding)
    {
        return DonationResource::make($funding->createDonation($request->validated()));
    }

    public function show(Donation $donation)
    {
        return DonationResource::make($donation);
    }

    public function update(StoreDonationRequest $request, Donation $donation)
    {
        DB::transaction(fn () => $donation->update($request->validated()));

        return DonationResource::make($donation);
    }

    public function destroy(Donation $donation)
    {
        DB::transaction(fn () => $donation->delete());

        return response()->noContent();
    }
}
