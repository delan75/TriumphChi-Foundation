<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSponsorshipRequest;
use App\Http\Resources\SponsorshipResource;
use App\Models\Sponsorship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SponsorshipController extends Controller
{
    public function index(Request $request)
    {
        return SponsorshipResource::collection(Sponsorship::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreSponsorshipRequest $request)
    {
        return SponsorshipResource::make(DB::transaction(fn () => Sponsorship::create($request->validated())));
    }

    public function show(Sponsorship $sponsorship)
    {
        return SponsorshipResource::make($sponsorship);
    }

    public function update(StoreSponsorshipRequest $request, Sponsorship $sponsorship)
    {
        DB::transaction(fn () => $sponsorship->update($request->validated()));

        return SponsorshipResource::make($sponsorship);
    }

    public function destroy(Sponsorship $sponsorship)
    {
        DB::transaction(fn () => $sponsorship->delete());

        return response()->noContent();
    }
}
