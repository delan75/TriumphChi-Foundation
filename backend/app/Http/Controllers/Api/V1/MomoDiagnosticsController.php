<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\PaymentProviderException;
use App\Http\Controllers\Controller;
use App\Services\Payments\MtnMomoCollectionsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MomoDiagnosticsController extends Controller
{
    public function accountHolderStatus(Request $request, MtnMomoCollectionsService $momo): JsonResponse
    {
        $validated = $request->validate([
            'msisdn' => ['required', 'string', 'max:20', 'regex:/^\+?[1-9][0-9\s-]{7,18}$/'],
        ]);

        try {
            $status = $momo->validateAccountHolderStatus($validated['msisdn']);
        } catch (PaymentProviderException $exception) {
            return $this->error($exception->getMessage(), Response::HTTP_BAD_GATEWAY);
        }

        return $this->success($status, __('api.messages.momo_account_holder_status_retrieved'));
    }
}
