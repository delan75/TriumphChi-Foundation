<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\FileSecurityScanner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogMediaController extends Controller
{
    public function store(Request $request, FileSecurityScanner $scanner): JsonResponse
    {
        if (! ($request->user()?->can('blog_posts.create') || $request->user()?->can('blog_posts.update'))) {
            return $this->forbidden();
        }

        $request->validate([
            'media' => ['required', 'array', 'max:8'],
            'media.*' => ['required', 'file', 'max:51200', 'mimes:jpg,jpeg,png,webp,svg,mp4,webm,mov'],
        ]);

        $stored = [];

        foreach ($request->file('media', []) as $file) {
            $scan = $scanner->scanMedia($file);

            if (! $scan->passed) {
                return response()->json([
                    'message' => __($scan->messageKey ?? 'api.blog.unsafe_media', [
                        'file' => $file->getClientOriginalName(),
                    ]),
                ], 422);
            }

            $extension = strtolower($file->getClientOriginalExtension());
            $storedName = Str::uuid()->toString().'.'.$extension;
            $path = Storage::disk('public')->putFileAs(
                'blog-media/'.now()->format('Y/m'),
                $file,
                $storedName,
                ['visibility' => 'public'],
            );
            $title = $this->titleFromFilename($file->getClientOriginalName());

            $stored[] = [
                'type' => str_starts_with((string) $file->getMimeType(), 'video/') ? 'video' : 'image',
                'url' => Storage::disk('public')->url($path),
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'title' => ['en' => $title, 'fr' => $title],
                'alt' => ['en' => $title, 'fr' => $title],
                'caption' => ['en' => null, 'fr' => null],
                'credit' => null,
                'position' => 0,
                'layout' => 'full',
            ];
        }

        return $this->created([
            'media' => $stored,
        ], __('api.blog.media_uploaded'));
    }

    private function titleFromFilename(string $filename): string
    {
        $name = pathinfo($filename, PATHINFO_FILENAME);

        return Str::headline(str_replace(['-', '_'], ' ', $name)) ?: 'Blog media';
    }
}
