<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

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

            foreach ($request->file('attachments', []) as $file) {
                $path = $file->store("contact-messages/{$contactMessage->uuid}", 'local');

                $contactMessage->attachments()->create([
                    'original_name' => $file->getClientOriginalName(),
                    'stored_name' => basename($path),
                    'path' => $path,
                    'disk' => 'local',
                    'mime_type' => $file->getMimeType(),
                    'size_bytes' => $file->getSize(),
                    'scan_status' => 'passed',
                ]);
            }

            return $contactMessage->load('attachments');
        });

        return $this->created([
            'id' => $contactMessage->uuid,
            'attachments_count' => $contactMessage->attachments->count(),
        ], __('api.contact.received'));
    }
}
