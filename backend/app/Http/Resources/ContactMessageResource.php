<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactMessageResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        $canViewAttachments = $request->user()?->can('contact_messages.attachments.view') ?? false;

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'reason' => $this->reason,
            'reason_label' => $this->localizedLabel('contact_reasons', $this->reason),
            'subject' => $this->subject,
            'message' => $this->message,
            'locale' => $this->locale,
            'status' => $this->status,
            'status_label' => $this->localizedLabel('contact_message_statuses', $this->status),
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'staff_notes' => $this->staff_notes,
            'attachments_count' => (int) ($this->attachments_count ?? $this->attachments->count()),
            'has_attachments' => ((int) ($this->attachments_count ?? $this->attachments->count())) > 0,
            'attachments' => $this->whenLoaded('attachments', fn () => $this->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'original_name' => $attachment->original_name,
                'mime_type' => $attachment->mime_type,
                'size_bytes' => $attachment->size_bytes,
                'scan_status' => $attachment->scan_status,
                'download_url' => $canViewAttachments ? route('api.v1.contact-messages.attachments.download', [
                    'contactMessage' => $this->uuid,
                    'attachment' => $attachment->id,
                ]) : null,
            ])->values()),
            'handler' => $this->whenLoaded('handler', fn () => $this->handler ? [
                'id' => $this->handler->id,
                'name' => $this->handler->name,
                'email' => $this->handler->email,
            ] : null),
            'responded_at' => $this->responded_at,
            'reviewed_at' => $this->reviewed_at,
            'archived_at' => $this->archived_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'permissions' => [
                'can_view' => $request->user()?->can('contact_messages.view') ?? false,
                'can_update' => $request->user()?->can('contact_messages.update') ?? false,
                'can_archive' => $request->user()?->can('contact_messages.archive') ?? false,
                'can_view_attachments' => $canViewAttachments,
            ],
        ];
    }
}
