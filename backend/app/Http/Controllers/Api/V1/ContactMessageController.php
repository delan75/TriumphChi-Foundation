<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContactMessageController extends Controller
{
    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        $contactMessage = DB::transaction(function () use ($request): ContactMessage {
            $contactMessage = ContactMessage::create([
                'name' => $request->string('name')->toString(),
                'email' => $request->string('email')->toString(),
                'phone' => $request->filled('phone') ? $request->string('phone')->toString() : null,
                'reason' => $request->string('reason')->toString(),
                'subject' => $request->filled('subject') ? $request->string('subject')->toString() : null,
                'message' => $request->string('message')->toString(),
                'locale' => app()->getLocale(),
                'status' => 'new',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            foreach ($request->input('draft_attachments', []) as $draft) {
                $disk = config('filesystems.private_upload_disk', 'local');
                // The filename from the draft path (e.g., drafts/contact-messages/uuid.jpg)
                $storedName = basename($draft['path']);
                $finalPath = "contact-messages/{$contactMessage->uuid}/{$storedName}";

                // Move the file from the draft location to the final location
                if (Storage::disk($disk)->exists($draft['path'])) {
                    Storage::disk($disk)->move($draft['path'], $finalPath);

                    $contactMessage->attachments()->create([
                        'original_name' => $draft['original_name'],
                        'stored_name' => $storedName,
                        'path' => $finalPath,
                        'disk' => $disk,
                        'mime_type' => $draft['mime_type'],
                        'size_bytes' => $draft['size'],
                        'scan_status' => 'passed',
                    ]);
                }
            }

            return $contactMessage->load('attachments');
        });

        return $this->created([
            'id' => $contactMessage->uuid,
            'attachments_count' => $contactMessage->attachments->count(),
        ], __('api.contact.received'));
    }
}
