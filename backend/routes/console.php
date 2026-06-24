<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Storage;
use App\Services\DonationPaymentReconciliationService;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('paypal:reconcile-donations {--limit=100}', function (DonationPaymentReconciliationService $reconciliation) {
    $summary = $reconciliation->reconcileOpenPaypalDonations((int) $this->option('limit'));

    $this->info("PayPal donations checked: {$summary['checked']}");
    $this->info("PayPal donations updated: {$summary['updated']}");
    $this->info("PayPal reconciliation failures: {$summary['failed']}");
})->purpose('Re-check open PayPal donation captures and update local donation status');

Schedule::call(function () {
    $disk = config('filesystems.private_upload_disk', 'local');
    $files = Storage::disk($disk)->files('drafts/contact-messages');
    $now = now();
    $pruned = 0;

    foreach ($files as $file) {
        if ($now->diffInHours(\Carbon\Carbon::createFromTimestamp(Storage::disk($disk)->lastModified($file))) >= 24) {
            Storage::disk($disk)->delete($file);
            $pruned++;
        }
    }

    if ($pruned > 0) {
        \Illuminate\Support\Facades\Log::info("Pruned {$pruned} abandoned draft attachments.");
    }
})->daily();

Schedule::command('paypal:reconcile-donations --limit=100')->everySixHours();
