<?php

use App\Http\Controllers\Api\V1\AllocationController;
use App\Http\Controllers\Api\V1\ApplicationController;
use App\Http\Controllers\Api\V1\BeneficiaryController;
use App\Http\Controllers\Api\V1\DonationController;
use App\Http\Controllers\Api\V1\FundController;
use App\Http\Controllers\Api\V1\ImpactUpdateController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\SchoolController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::get('health', fn () => ['status' => 'ok']);

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::apiResource('applications', ApplicationController::class);
        Route::patch('applications/{application}/status', [ApplicationController::class, 'transition']);

        Route::apiResource('beneficiaries', BeneficiaryController::class);
        Route::apiResource('schools', SchoolController::class);
        Route::apiResource('donations', DonationController::class);
        Route::apiResource('funds', FundController::class);
        Route::apiResource('allocations', AllocationController::class)->only(['index', 'store', 'show']);
        Route::apiResource('payments', PaymentController::class);
        Route::apiResource('impact-updates', ImpactUpdateController::class);
    });
});

