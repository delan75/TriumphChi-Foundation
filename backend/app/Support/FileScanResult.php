<?php

namespace App\Support;

class FileScanResult
{
    private function __construct(
        public readonly bool $passed,
        public readonly string $reason = 'passed',
        public readonly ?string $messageKey = null,
    ) {
    }

    public static function passed(): self
    {
        return new self(true);
    }

    public static function failed(string $reason, string $messageKey): self
    {
        return new self(false, $reason, $messageKey);
    }
}
