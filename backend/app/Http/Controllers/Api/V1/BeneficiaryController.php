<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBeneficiaryRequest;
use App\Http\Resources\BeneficiaryResource;
use App\Models\Beneficiary;
use Illuminate\Http\Request;

class BeneficiaryController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Beneficiary::class);

        return BeneficiaryResource::collection(
            Beneficiary::query()
                ->with(['school', 'needs'])
                ->latest()
                ->paginate($request->integer('per_page', 15))
        );
    }

    public function store(StoreBeneficiaryRequest $request)
    {
        $this->authorize('create', Beneficiary::class);

        return BeneficiaryResource::make(Beneficiary::create($request->validated())->load(['school', 'needs']));
    }

    public function show(Beneficiary $beneficiary)
    {
        $this->authorize('view', $beneficiary);

        return BeneficiaryResource::make($beneficiary->load(['school', 'needs']));
    }

    public function update(StoreBeneficiaryRequest $request, Beneficiary $beneficiary)
    {
        $this->authorize('update', $beneficiary);

        $beneficiary->update($request->validated());

        return BeneficiaryResource::make($beneficiary->load(['school', 'needs']));
    }

    public function destroy(Beneficiary $beneficiary)
    {
        $this->authorize('delete', $beneficiary);
        $beneficiary->delete();

        return response()->noContent();
    }
}

