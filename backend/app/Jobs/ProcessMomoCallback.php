<?php

namespace App\Jobs;

use App\Services\Payments\MtnMomoCollectionsService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessMomoCallback implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $hash,
        private readonly array $payload,
    ) {
    }

    public function handle(MtnMomoCollectionsService $momo): void
    {
        $momo->handleCallback($this->hash, $this->payload);
    }
}
