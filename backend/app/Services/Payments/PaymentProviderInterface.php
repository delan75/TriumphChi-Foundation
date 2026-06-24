<?php

namespace App\Services\Payments;

use App\Models\PaymentIntent;

interface PaymentProviderInterface
{
    public function initiate(PaymentIntent $intent, array $donorData): PaymentIntent;

    public function refreshStatus(PaymentIntent $intent): PaymentIntent;
}
