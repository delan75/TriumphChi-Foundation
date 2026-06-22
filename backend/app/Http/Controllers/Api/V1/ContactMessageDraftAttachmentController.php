<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContactMessageDraftAttachmentController extends Controller
{
    public function store(Request $request, \App\Support\FileSecurityScanner $scanner): JsonResponse
    {
        $request->validate([
            'attachment' => ['required', 'file', 'max:5120', 'mimes:pdf,doc,docx,jpg,jpeg,png'],
        ]);

        $file = $request->file('attachment');

        $scan = $scanner->scan($file);
        if (! $scan->passed) {
            return response()->json([
                'message' => __($scan->messageKey ?? 'api.contact.unsafe_attachment'),
            ], 422);
        }

        $disk = config('filesystems.private_upload_disk', 'local');
        $storedName = Str::uuid()->toString().'.'.strtolower($file->getClientOriginalExtension());
        
        $path = Storage::disk($disk)->putFileAs(
            'drafts/contact-messages',
            $file,
            $storedName,
            ['visibility' => 'private']
        );

        return response()->json([
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ], 201);
    }
}
