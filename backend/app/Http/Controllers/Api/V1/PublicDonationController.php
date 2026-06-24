<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\PaymentProviderException;
use App\Exceptions\SimilarDonationPendingException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublicDonationIntentRequest;
use App\Jobs\ProcessMomoCallback;
use App\Models\Donation;
use App\Models\DonationDocument;
use App\Models\PaymentIntent;
use App\Services\DonationDocumentService;
use App\Services\Payments\MtnMomoCollectionsService;
use App\Services\Payments\PaypalDonationProvider;
use App\Services\PublicDonationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\IpUtils;
use Symfony\Component\HttpFoundation\Response;
use Spatie\LaravelPdf\Facades\Pdf;

class PublicDonationController extends Controller
{
    public function config(Request $request, PublicDonationService $donations): JsonResponse
    {
        return $this->success($donations->config($request), __('api.messages.donation_config_retrieved'));
    }

    public function storeIntent(StorePublicDonationIntentRequest $request, PublicDonationService $donations): JsonResponse
    {
        try {
            $intent = $donations->createIntent($request->validated());
        } catch (SimilarDonationPendingException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'code' => 'similar_donation_pending',
                'data' => [
                    'similar_donation' => $exception->similarDonation,
                ],
            ], Response::HTTP_CONFLICT);
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

    public function status(PaymentIntent $paymentIntent, MtnMomoCollectionsService $momo, PaypalDonationProvider $paypal): JsonResponse
    {
        if ($paymentIntent->provider?->key === 'momo' && $paymentIntent->status === 'pending') {
            try {
                $paymentIntent = $momo->refreshStatus($paymentIntent);
            } catch (PaymentProviderException) {
                $paymentIntent->load(['donation', 'provider']);
            }
        }

        if ($paymentIntent->provider?->key === 'paypal' && in_array($paymentIntent->status, ['pending', 'processing'], true)) {
            try {
                $paymentIntent = $paypal->refreshStatus($paymentIntent);
            } catch (PaymentProviderException) {
                $paymentIntent->load(['donation', 'provider']);
            }
        }

        return $this->success($this->intentPayload($paymentIntent->load(['donation', 'provider'])), __('api.messages.donation_intent_status_retrieved'));
    }

    public function capturePaypal(PaymentIntent $paymentIntent, Request $request, PaypalDonationProvider $paypal): JsonResponse
    {
        try {
            $paymentIntent = $paypal->captureApprovedOrder($paymentIntent->load(['donation', 'provider']), $request->string('order_id')->toString());
        } catch (PaymentProviderException $exception) {
            return $this->error($exception->getMessage(), $exception->getCode() >= 400 ? $exception->getCode() : Response::HTTP_BAD_GATEWAY);
        }

        return $this->success($this->intentPayload($paymentIntent), __('api.messages.paypal_donation_verified'));
    }

    public function cancelPaypal(PaymentIntent $paymentIntent, PaypalDonationProvider $paypal): JsonResponse
    {
        $paymentIntent = $paypal->cancel($paymentIntent->load(['donation', 'provider']));

        return $this->success($this->intentPayload($paymentIntent), __('api.messages.paypal_donation_cancelled'));
    }

    public function paypalWebhook(Request $request, PaypalDonationProvider $paypal): JsonResponse
    {
        try {
            $paypal->handleWebhook($request);
        } catch (PaymentProviderException $exception) {
            return $this->error($exception->getMessage(), Response::HTTP_BAD_REQUEST);
        }

        return $this->success(null, __('api.messages.paypal_webhook_received'));
    }

    public function downloadDocument(Donation $donation, DonationDocument $document, DonationDocumentService $documents)
    {
        abort_unless($document->donation_id === $donation->id, 404);
        abort_unless(($donation->status->value ?? $donation->status) === 'confirmed', 404);

        $documents->ensureIssuedDocuments($donation, $document->locale);
        $document->refresh();

        return Pdf::view('pdf.donation_document', [
            'donation' => $donation->loadMissing(['donor', 'fund']),
            'document' => $document,
        ])
            ->format('A4')
            ->margins(8, 8, 8, 8)
            ->name($document->document_number.'.pdf');
    }

    private function intentPayload(PaymentIntent $intent): array
    {
        $intent->donation->loadMissing(['donor', 'fund']);
        $documents = app(DonationDocumentService::class)
            ->ensureIssuedDocuments($intent->donation, app()->getLocale());

        return [
            'uuid' => $intent->uuid,
            'intent_reference' => $intent->intent_reference,
            'donation' => [
                'uuid' => $intent->donation->uuid,
                'reference_number' => $intent->donation->reference_number,
                'status' => $intent->donation->status->value ?? $intent->donation->status,
                'documents' => $documents->map(fn (DonationDocument $document) => [
                    'uuid' => $document->uuid,
                    'document_number' => $document->document_number,
                    'type' => $document->type,
                    'title' => $document->title,
                    'locale' => $document->locale,
                    'issued_at' => $document->issued_at,
                    'download_url' => route('api.v1.public.donation-documents.download', [
                        'donation' => $intent->donation->uuid,
                        'document' => $document->uuid,
                    ]),
                ])->values(),
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
