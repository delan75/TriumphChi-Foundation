<?php

namespace App\Support;

use finfo;
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

    public function scan(UploadedFile $file): FileScanResult
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $path = $file->getRealPath();

        if (in_array($extension, self::BLOCKED_EXTENSIONS, true)) {
            return FileScanResult::failed('blocked_extension', 'api.contact.blocked_attachment');
        }

        if (! in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            return FileScanResult::failed('unsupported_extension', 'api.contact.unsupported_attachment');
        }

        if ($this->hasSuspiciousDoubleExtension($file, $extension)) {
            return FileScanResult::failed('double_extension', 'api.contact.suspicious_attachment');
        }

        if (! $path || ! is_readable($path)) {
            return FileScanResult::failed('unreadable', 'api.contact.unreadable_attachment');
        }

        $realMime = (string) (new finfo(FILEINFO_MIME_TYPE))->file($path);

        if (! in_array($realMime, self::ALLOWED_MIME_TYPES, true)) {
            return FileScanResult::failed('unsupported_mime', 'api.contact.unsupported_attachment');
        }

        if ($this->hasUnsafeSignature($path)) {
            return FileScanResult::failed('unsafe_signature', 'api.contact.unsafe_attachment');
        }

        if ($this->isImage($extension) && @getimagesize($path) === false) {
            return FileScanResult::failed('invalid_image', 'api.contact.invalid_image_attachment');
        }

        return FileScanResult::passed();
    }

    private function hasSuspiciousDoubleExtension(UploadedFile $file, string $extension): bool
    {
        $parts = array_values(array_filter(
            explode('.', strtolower($file->getClientOriginalName())),
            fn (string $part): bool => $part !== '',
        ));

        if (count($parts) < 3) {
            return false;
        }

        $intermediateExtensions = array_slice($parts, 1, -1);

        if (array_intersect($intermediateExtensions, self::BLOCKED_EXTENSIONS)) {
            return true;
        }

        return in_array($extension, self::ALLOWED_EXTENSIONS, true)
            && count(array_intersect($intermediateExtensions, self::ALLOWED_EXTENSIONS)) > 0;
    }

    private function hasUnsafeSignature(string $path): bool
    {
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

        return false;
    }

    private function isImage(string $extension): bool
    {
        return in_array($extension, ['png', 'jpg', 'jpeg'], true);
    }
}
