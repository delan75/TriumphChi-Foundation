<?php

namespace App\Http\Requests;

use App\Support\FileSecurityScanner;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Validator;

class StoreContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'reason' => ['required', 'string', 'in:sponsorship,assistance,school,volunteer,partnership,general'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'draft_attachments' => ['nullable', 'array', 'max:3'],
            'draft_attachments.*.path' => ['required', 'string'],
            'draft_attachments.*.original_name' => ['required', 'string'],
            'draft_attachments.*.size' => ['required', 'integer'],
            'draft_attachments.*.mime_type' => ['required', 'string'],
            'consent' => ['accepted'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        // Scanning is now done at the draft attachment upload stage.
    }

    public function messages(): array
    {
        return [
            'draft_attachments.max' => __('api.contact.too_many_attachments'),
            'consent.accepted' => __('api.contact.consent_required'),
        ];
    }
}
