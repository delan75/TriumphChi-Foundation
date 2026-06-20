<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;

class FileSecurityScanner
{
    private const ALLOWED_EXTENSIONS = [
        'pdf',
        'txt',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'png',
        'jpg',
        'jpeg',
    ];

    private const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
    ];

    private const BLOCKED_EXTENSIONS = [
        'bat',
        'bin',
        'cmd',
        'com',
        'dll',
        'elf',
        'exe',
        'js',
        'msi',
        'php',
        'ps1',
        'sh',
        'sql',
        'vbs',
    ];

    public function passes(UploadedFile $file): bool
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = (string) $file->getMimeType();

        if (in_array($extension, self::BLOCKED_EXTENSIONS, true)) {
            return false;
        }

        if (! in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            return false;
        }

        if (! in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            return false;
        }

        return ! $this->hasUnsafeSignature($file, $extension);
    }

    private function hasUnsafeSignature(UploadedFile $file, string $extension): bool
    {
        $path = $file->getRealPath();

        if (! $path || ! is_readable($path)) {
            return true;
        }

        $handle = fopen($path, 'rb');

        if (! $handle) {
            return true;
        }

        $sample = (string) fread($handle, 4096);
        fclose($handle);

        if (str_starts_with($sample, "MZ") || str_starts_with($sample, "\x7FELF")) {
            return true;
        }

        if (str_contains($sample, '<?php') || str_contains($sample, '<script')) {
            return true;
        }

        if ($extension === 'sql') {
            return true;
        }

        if ($extension === 'txt') {
            $lowerSample = strtolower($sample);

            return str_contains($lowerSample, '-- mysql dump')
                || str_contains($lowerSample, 'drop database')
                || str_contains($lowerSample, 'create table');
        }

        return false;
    }
}
