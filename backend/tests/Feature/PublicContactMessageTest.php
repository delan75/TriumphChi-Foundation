<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicContactMessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_contact_message_can_be_submitted_with_attachment(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('school-letter.pdf', 120, 'application/pdf');

        $response = $this->withHeader('Accept-Language', 'fr')
            ->post('/api/v1/public/contact-messages', [
                'name' => 'Grace Talla',
                'email' => 'grace@example.org',
                'phone' => '+237 600 000 000',
                'reason' => 'assistance',
                'message' => 'Please help us understand how to request school assistance.',
                'consent' => '1',
                'attachments' => [$file],
            ], [
                'Accept' => 'application/json',
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.')
            ->assertJsonPath('data.attachments_count', 1);

        $contactMessage = ContactMessage::firstOrFail();

        $this->assertNotNull($contactMessage->uuid);
        $this->assertNull($contactMessage->subject);
        $this->assertDatabaseHas('contact_messages', [
            'email' => 'grace@example.org',
            'reason' => 'assistance',
            'locale' => 'fr',
        ]);
        $this->assertDatabaseHas('contact_message_attachments', [
            'contact_message_id' => $contactMessage->id,
            'original_name' => 'school-letter.pdf',
            'scan_status' => 'passed',
        ]);
        Storage::disk('local')->assertExists($contactMessage->attachments()->firstOrFail()->path);
    }

    public function test_public_contact_message_rejects_unsafe_attachment(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('malicious.exe', 20, 'application/x-msdownload');

        $this->post('/api/v1/public/contact-messages', [
            'name' => 'Unsafe Sender',
            'email' => 'unsafe@example.org',
            'reason' => 'general',
            'message' => 'This message has enough characters.',
            'consent' => '1',
            'attachments' => [$file],
        ], [
            'Accept' => 'application/json',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('attachments.0');

        $this->assertDatabaseCount('contact_messages', 0);
        $this->assertDatabaseCount('contact_message_attachments', 0);
    }

    public function test_public_contact_message_requires_minimum_message_length(): void
    {
        $this->post('/api/v1/public/contact-messages', [
            'name' => 'Short Message',
            'email' => 'short@example.org',
            'reason' => 'general',
            'message' => 'Too short',
            'consent' => '1',
        ], [
            'Accept' => 'application/json',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('message');
    }
}
