<?php

use App\Http\Controllers\Api\V1\AllocationController;
use App\Http\Controllers\Api\V1\ApplicationController;
use App\Http\Controllers\Api\V1\BeneficiaryController;
use App\Http\Controllers\Api\V1\DonationController;
use App\Http\Controllers\Api\V1\DonorController;
use App\Http\Controllers\Api\V1\EducationalNeedController;
use App\Http\Controllers\Api\V1\FundController;
use App\Http\Controllers\Api\V1\ImpactUpdateController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\SchoolController;
use App\Http\Controllers\Api\V1\SponsorshipController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::get('health', fn () => ['status' => 'ok']);

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::apiResource('applications', ApplicationController::class)
            ->middlewareFor(['index', 'show'], 'can:applications.view')
            ->middlewareFor('store', 'can:applications.create')
            ->middlewareFor('update', 'can:applications.update')
            ->middlewareFor('destroy', 'can:applications.delete');

        Route::patch('applications/{application}/status', [ApplicationController::class, 'transition'])
            ->middleware('can:applications.verify');

        Route::apiResource('beneficiaries', BeneficiaryController::class)
            ->middlewareFor(['index', 'show'], 'can:beneficiaries.view')
            ->middlewareFor('store', 'can:beneficiaries.create')
            ->middlewareFor('update', 'can:beneficiaries.update')
            ->middlewareFor('destroy', 'can:beneficiaries.delete');

        Route::apiResource('schools', SchoolController::class)
            ->middlewareFor(['index', 'show'], 'can:schools.view')
            ->middlewareFor('store', 'can:schools.create')
            ->middlewareFor('update', 'can:schools.update')
            ->middlewareFor('destroy', 'can:schools.delete');

        Route::apiResource('donors', DonorController::class)
            ->middlewareFor(['index', 'show'], 'can:donors.view')
            ->middlewareFor('store', 'can:donors.create')
            ->middlewareFor('update', 'can:donors.update')
            ->middlewareFor('destroy', 'can:donors.delete');

        Route::apiResource('donations', DonationController::class)
            ->middlewareFor(['index', 'show'], 'can:donations.view')
            ->middlewareFor('store', 'can:donations.create')
            ->middlewareFor('update', 'can:donations.update')
            ->middlewareFor('destroy', 'can:donations.approve');

        Route::apiResource('funds', FundController::class)
            ->middlewareFor(['index', 'show'], 'can:funds.view')
            ->middlewareFor('store', 'can:funds.create')
            ->middlewareFor('update', 'can:funds.update')
            ->middlewareFor('destroy', 'can:funds.update');

        Route::apiResource('educational-needs', EducationalNeedController::class)
            ->middlewareFor(['index', 'show'], 'can:beneficiaries.view')
            ->middlewareFor('store', 'can:beneficiaries.update')
            ->middlewareFor('update', 'can:beneficiaries.update')
            ->middlewareFor('destroy', 'can:beneficiaries.delete');

        Route::apiResource('allocations', AllocationController::class)
            ->only(['index', 'store', 'show'])
            ->middlewareFor(['index', 'show'], 'can:allocations.view')
            ->middlewareFor('store', 'can:allocations.create');

        Route::apiResource('payments', PaymentController::class)
            ->middlewareFor(['index', 'show'], 'can:payments.view')
            ->middlewareFor('store', 'can:payments.create')
            ->middlewareFor('update', 'can:payments.approve')
            ->middlewareFor('destroy', 'can:payments.approve');

        Route::apiResource('sponsorships', SponsorshipController::class)
            ->middlewareFor(['index', 'show'], 'can:donors.view')
            ->middlewareFor('store', 'can:donors.update')
            ->middlewareFor('update', 'can:donors.update')
            ->middlewareFor('destroy', 'can:donors.delete');

        Route::apiResource('impact-updates', ImpactUpdateController::class)
            ->middlewareFor(['index', 'show'], 'can:impact_updates.view')
            ->middlewareFor('store', 'can:impact_updates.create')
            ->middlewareFor('update', 'can:impact_updates.publish')
            ->middlewareFor('destroy', 'can:impact_updates.publish');
    });
});
