<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\PaymentProviderException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublicDonationIntentRequest;
use App\Jobs\ProcessMomoCallback;
use App\Models\PaymentIntent;
use App\Services\Payments\MtnMomoCollectionsService;
use App\Services\PublicDonationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\IpUtils;
use Symfony\Component\HttpFoundation\Response;

class PublicDonationController extends Controller
{
    public function config(PublicDonationService $donations): JsonResponse
    {
        return $this->success($donations->config(), __('api.messages.donation_config_retrieved'));
    }

    public function storeIntent(StorePublicDonationIntentRequest $request, PublicDonationService $donations): JsonResponse
    {
        try {
            $intent = $donations->createIntent($request->validated());
        } catch (PaymentProviderException $exception) {
            return $this->error(
                $exception->getMessage(),
                Response::HTTP_BAD_GATEWAY,
            );
        }

        return $this->created($this->intentPayload($intent), __('api.messages.donation_intent_created'));
    }

    public function momoCallback(Request $request, string $hash): JsonResponse
    {
        if ($this->momoCallbackIpAllowed($request)) {
            ProcessMomoCallback::dispatch($hash, $request->all());
        }

        return $this->success(null, __('api.messages.momo_callback_received'));
    }

    public function status(PaymentIntent $paymentIntent, MtnMomoCollectionsService $momo): JsonResponse
    {
        if ($paymentIntent->provider?->key === 'momo' && $paymentIntent->status === 'pending') {
            try {
                $paymentIntent = $momo->refreshStatus($paymentIntent);
            } catch (PaymentProviderException) {
                $paymentIntent->load(['donation', 'provider']);
            }
        }

        return $this->success($this->intentPayload($paymentIntent->load(['donation', 'provider'])), __('api.messages.donation_intent_status_retrieved'));
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

    private function momoCallbackIpAllowed(Request $request): bool
    {
        $allowedIps = config('momo.collections.callback_allowed_ips', []);

        if (empty($allowedIps)) {
            return true;
        }

        return IpUtils::checkIp($request->ip() ?? '', $allowedIps);
    }
}
