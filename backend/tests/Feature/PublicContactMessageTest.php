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

        $file = UploadedFile::fake()->createWithContent(
            'school-letter.pdf',
            "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF",
        );

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
        $attachment = $contactMessage->attachments()->firstOrFail();

        $this->assertMatchesRegularExpression('/^[0-9a-f-]{36}\.pdf$/', $attachment->stored_name);
        $this->assertDatabaseHas('contact_message_attachments', [
            'contact_message_id' => $contactMessage->id,
            'original_name' => 'school-letter.pdf',
            'stored_name' => $attachment->stored_name,
            'scan_status' => 'passed',
        ]);
        Storage::disk('local')->assertExists($attachment->path);
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

    public function test_public_contact_message_rejects_fake_image_attachment(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->createWithContent('photo.jpg', "\xFF\xD8\xFF\xE0not a complete image");

        $this->post('/api/v1/public/contact-messages', [
            'name' => 'Fake Image Sender',
            'email' => 'fake-image@example.org',
            'reason' => 'general',
            'message' => 'This message has enough characters.',
            'consent' => '1',
            'attachments' => [$file],
        ], [
            'Accept' => 'application/json',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('attachments.0')
            ->assertSee('image');

        $this->assertDatabaseCount('contact_messages', 0);
        $this->assertDatabaseCount('contact_message_attachments', 0);
    }

    public function test_public_contact_message_accepts_text_file_with_sql_words(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->createWithContent(
            'notes.txt',
            "Please review this school computer club note: CREATE TABLE students example only.",
        );

        $this->post('/api/v1/public/contact-messages', [
            'name' => 'Text Sender',
            'email' => 'text@example.org',
            'reason' => 'school',
            'message' => 'This message has enough characters.',
            'consent' => '1',
            'attachments' => [$file],
        ], [
            'Accept' => 'application/json',
        ])->assertCreated()
            ->assertJsonPath('data.attachments_count', 1);

        $this->assertDatabaseCount('contact_messages', 1);
        $this->assertDatabaseCount('contact_message_attachments', 1);
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
