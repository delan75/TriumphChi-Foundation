<?php

use App\Http\Controllers\Api\V1\AllocationController;
use App\Http\Controllers\Api\V1\ApplicationController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ContactMessageController;
use App\Http\Controllers\Api\V1\PasswordResetController;
use App\Http\Controllers\Api\V1\BeneficiaryController;
use App\Http\Controllers\Api\V1\DonationController;
use App\Http\Controllers\Api\V1\DonorController;
use App\Http\Controllers\Api\V1\DashboardSummaryController;
use App\Http\Controllers\Api\V1\EducationalNeedController;
use App\Http\Controllers\Api\V1\FundController;
use App\Http\Controllers\Api\V1\GlobalSearchController;
use App\Http\Controllers\Api\V1\ImpactUpdateController;
use App\Http\Controllers\Api\V1\MomoDiagnosticsController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PublicDonationController;
use App\Http\Controllers\Api\V1\PublicImpactController;
use App\Http\Controllers\Api\V1\PublicApplicationController;
use App\Http\Controllers\Api\V1\PublicApplicationTrackingController;
use App\Http\Controllers\Api\V1\PublicLookupController;
use App\Http\Controllers\Api\V1\SchoolController;
use App\Http\Controllers\Api\V1\SponsorshipController;
use App\Http\Controllers\Api\V1\SocialiteController;
use App\Http\Controllers\Api\V1\ContactMessageDraftAttachmentController;
use App\Http\Controllers\Api\V1\UserManagementController;
use App\Http\Middleware\SetLocale;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::get('health', fn () => ['status' => 'ok']);
    Route::get('public/impact-summary', PublicImpactController::class)
        ->middleware(SetLocale::class)
        ->name('public.impact-summary');
    Route::get('public/donation-config', [PublicDonationController::class, 'config'])
        ->middleware([SetLocale::class, 'throttle:30,1'])
        ->name('public.donation-config');
    Route::post('public/donation-intents', [PublicDonationController::class, 'storeIntent'])
        ->middleware([SetLocale::class, 'throttle:10,1'])
        ->name('public.donation-intents.store');
    Route::get('public/donation-intents/{paymentIntent}/status', [PublicDonationController::class, 'status'])
        ->middleware([SetLocale::class, 'throttle:20,1'])
        ->name('public.donation-intents.status');
    Route::post('public/donation-intents/{paymentIntent}/paypal/capture', [PublicDonationController::class, 'capturePaypal'])
        ->middleware([SetLocale::class, 'throttle:10,1'])
        ->name('public.donation-intents.paypal.capture');
    Route::post('public/donation-intents/{paymentIntent}/paypal/cancel', [PublicDonationController::class, 'cancelPaypal'])
        ->middleware([SetLocale::class, 'throttle:10,1'])
        ->name('public.donation-intents.paypal.cancel');
    Route::post('public/paypal/webhooks', [PublicDonationController::class, 'paypalWebhook'])
        ->middleware('throttle:120,1')
        ->name('public.paypal.webhooks');
    Route::get('public/donations/{donation}/documents/{document}/download', [PublicDonationController::class, 'downloadDocument'])
        ->middleware([SetLocale::class, 'throttle:20,1'])
        ->name('public.donation-documents.download');
    Route::post('public/momo/callbacks/{hash}', [PublicDonationController::class, 'momoCallback'])
        ->middleware('throttle:120,1')
        ->name('public.momo.callbacks');
    Route::post('public/contact-messages', [ContactMessageController::class, 'store'])
        ->middleware([SetLocale::class, 'throttle:5,1'])
        ->name('public.contact-messages.store');
    Route::post('public/contact-messages/draft-attachments', [ContactMessageDraftAttachmentController::class, 'store'])
        ->middleware([SetLocale::class, 'throttle:20,1'])
        ->name('public.contact-messages.draft-attachments.store');
    Route::post('public/applications', [PublicApplicationController::class, 'store'])
        ->middleware([SetLocale::class, 'throttle:5,1'])
        ->name('public.applications.store');
    Route::get('public/lookups/{type}', [PublicLookupController::class, 'index'])
        ->middleware([SetLocale::class, 'throttle:20,1'])
        ->name('public.lookups.index');
    Route::get('public/applications/track', [PublicApplicationTrackingController::class, 'show'])
        ->middleware([SetLocale::class, 'throttle:20,1'])
        ->name('public.applications.track');
    Route::prefix('public/applications')->name('public.applications.')->group(function () {
        Route::post('draft', [PublicApplicationController::class, 'initDraft'])
            ->middleware([SetLocale::class, 'throttle:5,1'])
            ->name('draft');

        Route::put('{token}/step/{step}', [PublicApplicationController::class, 'saveStep'])
            ->middleware([SetLocale::class, 'throttle:10,1'])
            ->name('step.save');

        Route::post('{token}/documents', [PublicApplicationController::class, 'uploadDocument'])
            ->middleware([SetLocale::class, 'throttle:10,1'])
            ->name('documents.upload');

        Route::post('{token}/submit', [PublicApplicationController::class, 'submit'])
            ->middleware([SetLocale::class, 'throttle:5,1'])
            ->name('submit');

        Route::get('{token}/pdf', [PublicApplicationController::class, 'generatePdf'])
            ->middleware([SetLocale::class, 'throttle:10,1'])
            ->name('pdf');
            
        Route::post('preview-pdf', [PublicApplicationController::class, 'previewPdf'])
            ->middleware([SetLocale::class, 'throttle:10,1'])
            ->name('preview.pdf');
            
        // Legacy single-payload endpoint (optional, might remove later if front-end completely migrated)
        Route::post('/', [PublicApplicationController::class, 'store'])
            ->middleware([SetLocale::class, 'throttle:5,1'])
            ->name('store');
    });

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

        Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->middleware(['signed', 'throttle:6,1'])
            ->name('email.verify');

        Route::post('email/otp/resend', [AuthController::class, 'resendVerificationOtp'])
            ->middleware('throttle:3,1')
            ->name('email.otp.resend');

        Route::post('email/otp/verify', [AuthController::class, 'verifyOtp'])
            ->middleware('throttle:6,1')
            ->name('email.otp.verify');

        Route::post('verification/contact', [AuthController::class, 'updateVerificationContact'])
            ->middleware('throttle:5,1')
            ->name('verification.contact.update');

        Route::post('oauth/exchange', [AuthController::class, 'exchangeOAuthCode'])
            ->middleware('throttle:10,1')
            ->name('oauth.exchange');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me'])
                ->middleware('account.active')
                ->name('me');
            Route::post('logout', [AuthController::class, 'logout'])->name('logout');
            Route::post('logout-all', [AuthController::class, 'logoutAll'])->name('logout-all');
        });

        // ── Google OAuth ──────────────────────────────────────────────────────
        // OAuth identity providers.
        Route::get('google/redirect', [SocialiteController::class, 'redirectToGoogle'])
            ->middleware('throttle:10,1')
            ->name('google.redirect');

        // Google's callback — do NOT throttle here (Google controls the timing)
        Route::get('google/callback', [SocialiteController::class, 'handleGoogleCallback'])
            ->name('google.callback');

        Route::get('facebook/redirect', [SocialiteController::class, 'redirectToFacebook'])
            ->middleware('throttle:10,1')
            ->name('facebook.redirect');

        Route::get('facebook/callback', [SocialiteController::class, 'handleFacebookCallback'])
            ->name('facebook.callback');

        // ── Provider management (authenticated) ───────────────────────────────
        Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
            Route::get('social/providers', [SocialiteController::class, 'listProviders'])
                ->name('social.providers');
            Route::delete('social/{provider}', [SocialiteController::class, 'unlinkProvider'])
                ->middleware('throttle:5,1')
                ->name('social.unlink');
        });
    });

    Route::middleware(['auth:sanctum', 'account.active', SetLocale::class])->group(function () {
        Route::get('dashboard/summary', DashboardSummaryController::class)
            ->name('dashboard.summary');

        Route::get('global-search', GlobalSearchController::class)
            ->name('global-search');

        Route::get('users/access-options', [UserManagementController::class, 'accessOptions'])
            ->middleware('can:users.view')
            ->name('users.access-options');

        Route::patch('users/{user}/access', [UserManagementController::class, 'updateAccess'])
            ->middleware('can:users.access.manage')
            ->name('users.access');

        Route::post('users/{user}/activate', [UserManagementController::class, 'activate'])
            ->middleware('can:users.activate')
            ->name('users.activate');

        Route::post('users/{user}/suspend', [UserManagementController::class, 'suspend'])
            ->middleware('can:users.suspend')
            ->name('users.suspend');

        Route::post('users/{user}/archive', [UserManagementController::class, 'archive'])
            ->middleware('can:users.archive')
            ->name('users.archive');

        Route::post('users/{user}/terminate-sessions', [UserManagementController::class, 'terminateSessions'])
            ->middleware('can:users.sessions.manage')
            ->name('users.terminate-sessions');

        Route::apiResource('users', UserManagementController::class)
            ->only(['index', 'show', 'store', 'update'])
            ->middlewareFor(['index', 'show'], 'can:users.view')
            ->middlewareFor('store', 'can:users.create')
            ->middlewareFor('update', 'can:users.update');

        Route::get('payment-providers/momo/account-holder-status', [MomoDiagnosticsController::class, 'accountHolderStatus'])
            ->middleware('can:payments.view')
            ->name('payment-providers.momo.account-holder-status');

        Route::get('applications/{application}/pdf', [ApplicationController::class, 'pdf'])
            ->middleware('can:applications.view')
            ->name('applications.pdf');

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

        Route::get('contact-messages/{contactMessage}/attachments/{attachment}/download', [ContactMessageController::class, 'downloadAttachment'])
            ->middleware('can:contact_messages.attachments.view')
            ->name('contact-messages.attachments.download');

        Route::get('contact-messages/assignable-users', [ContactMessageController::class, 'assignableUsers'])
            ->middleware('can:contact_messages.update')
            ->name('contact-messages.assignable-users');

        Route::patch('contact-messages/{contactMessage}/assignment', [ContactMessageController::class, 'assign'])
            ->middleware('can:contact_messages.update')
            ->name('contact-messages.assignment');

        Route::post('contact-messages/{contactMessage}/forward', [ContactMessageController::class, 'forward'])
            ->middleware('can:contact_messages.update')
            ->name('contact-messages.forward');

        Route::apiResource('contact-messages', ContactMessageController::class)
            ->only(['index', 'show', 'update', 'destroy'])
            ->middlewareFor(['index', 'show'], 'can:contact_messages.view')
            ->middlewareFor('update', 'can:contact_messages.update')
            ->middlewareFor('destroy', 'can:contact_messages.archive');
        Route::get('donations/{donation}/documents/{document}/download', [DonationController::class, 'downloadDocument'])
            ->middleware('can:donations.view')
            ->name('donations.documents.download');

        Route::post('donations/{donation}/payment-status', [DonationController::class, 'refreshPaymentStatus'])
            ->middleware('can:donations.approve')
            ->name('donations.payment-status.refresh');

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
