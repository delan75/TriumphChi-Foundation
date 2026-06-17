<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        return PaymentResource::collection(Payment::query()->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(StorePaymentRequest $request)
    {
        return PaymentResource::make(Payment::create($request->validated()));
    }

    public function show(Payment $payment)
    {
        return PaymentResource::make($payment);
    }

    public function update(StorePaymentRequest $request, Payment $payment)
    {
        $payment->update($request->validated());

        return PaymentResource::make($payment);
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();

        return response()->noContent();
    }
}

