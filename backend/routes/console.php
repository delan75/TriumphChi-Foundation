<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

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

