<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublicDonationIntentRequest;
use App\Models\PaymentIntent;
use App\Services\PublicDonationService;
use Illuminate\Http\JsonResponse;

class PublicDonationController extends Controller
{
    public function config(PublicDonationService $donations): JsonResponse
    {
        return $this->success($donations->config(), __('api.messages.donation_config_retrieved'));
    }

    public function storeIntent(StorePublicDonationIntentRequest $request, PublicDonationService $donations): JsonResponse
    {
        $intent = $donations->createIntent($request->validated());

        return $this->created($this->intentPayload($intent), __('api.messages.donation_intent_created'));
    }

    private function intentPayload(PaymentIntent $intent): array
    {
        return [
            'uuid' => $intent->uuid,
            'intent_reference' => $intent->intent_reference,
            'donation' => [
                'uuid' => $intent->donation->uuid,
                'reference_number' => $intent->donation->reference_number,
                'status' => $intent->donation->status->value ?? $intent->donation->status,
            ],
            'payment_provider' => [
                'key' => $intent->provider->key,
                'name' => $intent->provider->name,
                'category' => $intent->provider->category,
            ],
            'amount' => $intent->amount,
            'currency' => $intent->currency,
            'frequency' => $intent->frequency,
            'purpose' => $intent->purpose,
            'status' => $intent->status,
            'checkout_url' => $intent->checkout_url,
            'expires_at' => $intent->expires_at,
        ];
    }
}
