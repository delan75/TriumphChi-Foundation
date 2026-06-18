<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\FundingTransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        return PaymentResource::collection(Payment::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StorePaymentRequest $request, FundingTransactionService $funding)
    {
        return PaymentResource::make($funding->createPayment($request->validated(), $request->user()));
    }

    public function show(Payment $payment)
    {
        return PaymentResource::make($payment);
    }

    public function update(StorePaymentRequest $request, Payment $payment)
    {
        DB::transaction(function () use ($payment, $request): void {
            $data = $request->validated();
            unset($data['allocations']);

            $payment->update($data);
        });

        return PaymentResource::make($payment);
    }

    public function destroy(Payment $payment)
    {
        DB::transaction(fn () => $payment->delete());

        return response()->noContent();
    }
}
