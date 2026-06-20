<?php

namespace App\Http\Requests;

use App\Support\FileSecurityScanner;
use Illuminate\Foundation\Http\FormRequest;
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
            'attachments' => ['nullable', 'array', 'max:3'],
            'attachments.*' => [
                'file',
                'max:5120',
                'mimes:pdf,txt,doc,docx,xls,xlsx,png,jpg,jpeg',
            ],
            'consent' => ['accepted'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $scanner = app(FileSecurityScanner::class);

            foreach ($this->file('attachments', []) as $index => $file) {
                if (! $file || ! $scanner->passes($file)) {
                    $validator->errors()->add(
                        "attachments.{$index}",
                        __('api.contact.unsafe_attachment'),
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'attachments.max' => __('api.contact.too_many_attachments'),
            'attachments.*.max' => __('api.contact.attachment_too_large'),
            'attachments.*.mimes' => __('api.contact.unsupported_attachment'),
            'consent.accepted' => __('api.contact.consent_required'),
        ];
    }
}
