<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignContactMessageRequest;
use App\Http\Requests\ForwardContactMessageRequest;
use App\Http\Requests\ListContactMessageRequest;
use App\Http\Requests\StoreContactMessageRequest;
use App\Http\Requests\UpdateContactMessageRequest;
use App\Http\Resources\ContactMessageResource;
use App\Mail\ContactMessageForwarded;
use App\Models\ContactMessage;
use App\Models\ContactMessageAttachment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContactMessageController extends Controller
{
    public function assignableUsers(): JsonResponse
    {
        $this->authorizeMessage('contact_messages.update');

        $users = User::query()
            ->select(['id', 'name', 'email'])
            ->where('status', User::STATUS_ACTIVE)
            ->orderBy('name')
            ->limit(100)
            ->get();

        return $this->success($users, __('api.contact.assignable_users_retrieved'));
    }

    public function index(ListContactMessageRequest $request)
    {
        $filters = $request->validated();
        $query = $this->filteredQuery($filters)
            ->with(['handler:id,name,email'])
            ->withCount('attachments');
        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';

        $messages = $query
            ->orderBy($sort, $direction)
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return ContactMessageResource::collection($messages)
            ->additional([
                'summary' => $this->summaryFor($this->filteredQuery($filters)),
                'filters' => array_filter($filters, fn ($value) => $value !== null && $value !== ''),
            ]);
    }

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

    public function show(ContactMessage $contactMessage)
    {
        $this->authorizeMessage('contact_messages.view');

        return ContactMessageResource::make($contactMessage->load([
            'attachments',
            'handler:id,name,email',
        ]));
    }

    public function assign(AssignContactMessageRequest $request, ContactMessage $contactMessage)
    {
        $assignedTo = $request->validated('assigned_to');

        $contactMessage->forceFill([
            'handled_by' => $assignedTo,
            'status' => $assignedTo && $contactMessage->status === 'new' ? 'reviewing' : $contactMessage->status,
            'reviewed_at' => $assignedTo ? ($contactMessage->reviewed_at ?? now()) : $contactMessage->reviewed_at,
        ])->save();

        return $this->success(
            ContactMessageResource::make($contactMessage->fresh(['attachments', 'handler:id,name,email'])),
            __('api.contact.assigned'),
        );
    }

    public function forward(ForwardContactMessageRequest $request, ContactMessage $contactMessage)
    {
        $validated = $request->validated();
        $user = $request->user();

        $contactMessage->loadMissing(['attachments', 'handler:id,name,email']);

        Mail::to($validated['to_email'])
            ->send(new ContactMessageForwarded(
                $contactMessage,
                $validated['note'] ?? null,
                $user,
            ));

        $status = (bool) ($validated['mark_as_replied'] ?? false) ? 'replied' : $contactMessage->status;
        $status = $status === 'new' ? 'reviewing' : $status;

        $contactMessage->forceFill([
            'status' => $status,
            'handled_by' => $contactMessage->handled_by ?: $user?->id,
            'reviewed_at' => $contactMessage->reviewed_at ?? now(),
            'responded_at' => $status === 'replied' ? ($contactMessage->responded_at ?? now()) : $contactMessage->responded_at,
            'staff_notes' => $this->forwardingStaffNotes(
                $contactMessage->staff_notes,
                $validated['to_email'],
                $validated['note'] ?? null,
                $user?->name,
            ),
        ])->save();

        return $this->success(
            ContactMessageResource::make($contactMessage->fresh(['attachments', 'handler:id,name,email'])),
            __('api.contact.forwarded'),
        );
    }

    public function update(UpdateContactMessageRequest $request, ContactMessage $contactMessage)
    {
        $status = $request->validated('status');

        if ($status === 'archived') {
            abort_unless($request->user()?->can('contact_messages.archive'), 403);
        }

        $contactMessage->update([
            'status' => $status,
            'staff_notes' => $request->validated('staff_notes'),
            'handled_by' => $request->user()?->id,
            'reviewed_at' => in_array($status, ['reviewing', 'replied', 'archived', 'spam'], true)
                ? ($contactMessage->reviewed_at ?? now())
                : $contactMessage->reviewed_at,
            'responded_at' => $status === 'replied' ? now() : $contactMessage->responded_at,
            'archived_at' => $status === 'archived' ? now() : null,
        ]);

        return ContactMessageResource::make($contactMessage->fresh([
            'attachments',
            'handler:id,name,email',
        ]));
    }

    public function destroy(ContactMessage $contactMessage)
    {
        $this->authorizeMessage('contact_messages.archive');

        DB::transaction(fn () => $contactMessage->delete());

        return response()->noContent();
    }

    public function downloadAttachment(ContactMessage $contactMessage, ContactMessageAttachment $attachment)
    {
        $this->authorizeMessage('contact_messages.attachments.view');
        abort_unless($attachment->contact_message_id === $contactMessage->id, 404);
        abort_unless(Storage::disk($attachment->disk)->exists($attachment->path), 404);

        return Storage::disk($attachment->disk)->download($attachment->path, $attachment->original_name);
    }

    private function filteredQuery(array $filters)
    {
        return ContactMessage::query()
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['reason'] ?? null, fn ($query, string $reason) => $query->where('reason', $reason))
            ->when(array_key_exists('has_attachments', $filters), function ($query) use ($filters): void {
                filter_var($filters['has_attachments'], FILTER_VALIDATE_BOOLEAN)
                    ? $query->has('attachments')
                    : $query->doesntHave('attachments');
            })
            ->when($filters['created_from'] ?? null, fn ($query, string $date) => $query->where('created_at', '>=', Carbon::parse($date)->startOfDay()))
            ->when($filters['created_to'] ?? null, fn ($query, string $date) => $query->where('created_at', '<=', Carbon::parse($date)->endOfDay()))
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $search = trim($search);

                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%");
                });
            });
    }

    private function summaryFor($query): array
    {
        $base = clone $query;
        $statusCounts = (clone $query)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn ($value) => (int) $value)
            ->all();

        $reasonCounts = (clone $query)
            ->select('reason', DB::raw('count(*) as total'))
            ->groupBy('reason')
            ->pluck('total', 'reason')
            ->map(fn ($value) => (int) $value)
            ->all();

        return [
            'total_count' => (int) $base->count(),
            'status_counts' => $statusCounts,
            'reason_counts' => $reasonCounts,
            'attachments_count' => (int) (clone $query)->has('attachments')->count(),
        ];
    }

    private function authorizeMessage(string $permission): void
    {
        abort_unless(request()->user()?->can($permission), 403);
    }

    private function forwardingStaffNotes(?string $existingNotes, string $toEmail, ?string $note, ?string $forwardedBy): string
    {
        $forwardedBy = $forwardedBy ?: 'Staff member';
        $entry = "Forwarded to {$toEmail} by {$forwardedBy} on ".now()->toDayDateTimeString().'.';

        if (filled($note)) {
            $entry .= "\nNote: {$note}";
        }

        return Str::limit(trim(collect([$existingNotes, $entry])->filter()->implode("\n\n")), 3000, '');
    }
}
