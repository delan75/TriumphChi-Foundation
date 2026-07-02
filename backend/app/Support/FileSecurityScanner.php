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

    private const ALLOWED_MEDIA_EXTENSIONS = [
        'jpg',
        'jpeg',
        'png',
        'webp',
        'svg',
        'mp4',
        'webm',
        'mov',
    ];

    private const ALLOWED_MEDIA_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'video/quicktime',
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
        return $this->scanWith($file, self::ALLOWED_EXTENSIONS, self::ALLOWED_MIME_TYPES, 'api.contact');
    }

    public function scanMedia(UploadedFile $file): FileScanResult
    {
        return $this->scanWith($file, self::ALLOWED_MEDIA_EXTENSIONS, self::ALLOWED_MEDIA_MIME_TYPES, 'api.blog');
    }

    private function scanWith(UploadedFile $file, array $allowedExtensions, array $allowedMimeTypes, string $messagePrefix): FileScanResult
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $path = $file->getRealPath();
        $messages = $this->messagesFor($messagePrefix);

        if (in_array($extension, self::BLOCKED_EXTENSIONS, true)) {
            return FileScanResult::failed('blocked_extension', $messages['blocked']);
        }

        if (! in_array($extension, $allowedExtensions, true)) {
            return FileScanResult::failed('unsupported_extension', $messages['unsupported']);
        }

        if ($this->hasSuspiciousDoubleExtension($file, $extension, $allowedExtensions)) {
            return FileScanResult::failed('double_extension', $messages['suspicious']);
        }

        if (! $path || ! is_readable($path)) {
            return FileScanResult::failed('unreadable', $messages['unreadable']);
        }

        $realMime = (string) (new finfo(FILEINFO_MIME_TYPE))->file($path);

        if (! in_array($realMime, $allowedMimeTypes, true)) {
            return FileScanResult::failed('unsupported_mime', $messages['unsupported']);
        }

        if ($this->hasUnsafeSignature($path)) {
            return FileScanResult::failed('unsafe_signature', $messages['unsafe']);
        }

        if ($extension === 'svg' && $this->hasUnsafeSvg($path)) {
            return FileScanResult::failed('unsafe_svg', $messages['unsafe']);
        }

        if ($this->isRasterImage($extension) && @getimagesize($path) === false) {
            return FileScanResult::failed('invalid_image', $messages['invalid_image']);
        }

        return FileScanResult::passed();
    }

    private function hasSuspiciousDoubleExtension(UploadedFile $file, string $extension, array $allowedExtensions): bool
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

        return in_array($extension, $allowedExtensions, true)
            && count(array_intersect($intermediateExtensions, $allowedExtensions)) > 0;
    }

    private function hasUnsafeSignature(string $path): bool
    {
        $handle = fopen($path, 'rb');

        if (! $handle) {
            return true;
        }

        $sample = (string) fread($handle, 4096);
        fclose($handle);
        $lowerSample = strtolower($sample);

        if (str_starts_with($sample, "MZ") || str_starts_with($sample, "\x7FELF")) {
            return true;
        }

        if (str_contains($lowerSample, '<?php') || str_contains($lowerSample, '<script')) {
            return true;
        }

        return false;
    }

    private function hasUnsafeSvg(string $path): bool
    {
        $sample = strtolower((string) file_get_contents($path, false, null, 0, 8192));

        return str_contains($sample, '<script')
            || str_contains($sample, 'javascript:')
            || str_contains($sample, 'onload=')
            || str_contains($sample, '<foreignobject');
    }

    private function messagesFor(string $prefix): array
    {
        if ($prefix === 'api.contact') {
            return [
                'blocked' => 'api.contact.blocked_attachment',
                'unsupported' => 'api.contact.unsupported_attachment',
                'suspicious' => 'api.contact.suspicious_attachment',
                'unreadable' => 'api.contact.unreadable_attachment',
                'unsafe' => 'api.contact.unsafe_attachment',
                'invalid_image' => 'api.contact.invalid_image_attachment',
            ];
        }

        return [
            'blocked' => 'api.blog.blocked_media',
            'unsupported' => 'api.blog.unsupported_media',
            'suspicious' => 'api.blog.suspicious_media',
            'unreadable' => 'api.blog.unreadable_media',
            'unsafe' => 'api.blog.unsafe_media',
            'invalid_image' => 'api.blog.invalid_image_media',
        ];
    }

    private function isRasterImage(string $extension): bool
    {
        return in_array($extension, ['png', 'jpg', 'jpeg', 'webp'], true);
    }
}
