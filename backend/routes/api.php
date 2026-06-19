<?php

use App\Http\Controllers\Api\V1\AllocationController;
use App\Http\Controllers\Api\V1\ApplicationController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PasswordResetController;
use App\Http\Controllers\Api\V1\BeneficiaryController;
use App\Http\Controllers\Api\V1\DonationController;
use App\Http\Controllers\Api\V1\DonorController;
use App\Http\Controllers\Api\V1\EducationalNeedController;
use App\Http\Controllers\Api\V1\FundController;
use App\Http\Controllers\Api\V1\ImpactUpdateController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PublicImpactController;
use App\Http\Controllers\Api\V1\SchoolController;
use App\Http\Controllers\Api\V1\SponsorshipController;
use App\Http\Controllers\Api\V1\SocialiteController;
use App\Http\Middleware\SetLocale;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::get('health', fn () => ['status' => 'ok']);
    Route::get('public/impact-summary', PublicImpactController::class)
        ->middleware(SetLocale::class)
        ->name('public.impact-summary');

    Route::prefix('auth')->name('auth.')->middleware(SetLocale::class)->group(function () {
        Route::post('register', [AuthController::class, 'register'])
            ->middleware('throttle:5,1')
            ->name('register');

        Route::post('login', [AuthController::class, 'login'])
            ->middleware('throttle:5,1')
            ->name('login');

        Route::post('forgot-password', [PasswordResetController::class, 'forgotPassword'])
            ->middleware('throttle:3,1')
            ->name('password.email');

        Route::post('reset-password', [PasswordResetController::class, 'resetPassword'])
            ->middleware('throttle:5,1')
            ->name('password.reset');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me'])->name('me');
            Route::post('logout', [AuthController::class, 'logout'])->name('logout');
            Route::post('logout-all', [AuthController::class, 'logoutAll'])->name('logout-all');
        });

        // ── Google OAuth ──────────────────────────────────────────────────────
        // Redirect the browser to Google's consent screen
        Route::get('google/redirect', [SocialiteController::class, 'redirectToGoogle'])
            ->middleware('throttle:10,1')
            ->name('google.redirect');

        // Google's callback — do NOT throttle here (Google controls the timing)
        Route::get('google/callback', [SocialiteController::class, 'handleGoogleCallback'])
            ->name('google.callback');

        // ── Provider management (authenticated) ───────────────────────────────
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('social/providers', [SocialiteController::class, 'listProviders'])
                ->name('social.providers');
            Route::delete('social/{provider}', [SocialiteController::class, 'unlinkProvider'])
                ->middleware('throttle:5,1')
                ->name('social.unlink');
        });
    });

    Route::middleware(['auth:sanctum', SetLocale::class])->group(function () {
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
