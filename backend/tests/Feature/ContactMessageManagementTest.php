<?php

namespace Tests\Feature;

use App\Mail\ContactMessageForwarded;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ContactMessageManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_retrieve_assignable_contact_message_users(): void
    {
        $staff = $this->staffUser(['contact_messages.update']);
        $assignee = User::create([
            'name' => 'Contact Reviewer',
            'email' => 'contact-reviewer@example.org',
            'password' => 'secret-password',
            'preferred_locale' => 'en',
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);
        User::create([
            'name' => 'Disabled Reviewer',
            'email' => 'disabled-reviewer@example.org',
            'password' => 'secret-password',
            'preferred_locale' => 'en',
            'status' => User::STATUS_DISABLED,
        ]);

        Sanctum::actingAs($staff);

        $this->getJson('/api/v1/contact-messages/assignable-users')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment([
                'id' => $assignee->id,
                'name' => 'Contact Reviewer',
                'email' => 'contact-reviewer@example.org',
            ])
            ->assertJsonMissing([
                'email' => 'disabled-reviewer@example.org',
            ]);
    }

    public function test_staff_can_assign_contact_message_to_active_user(): void
    {
        $staff = $this->staffUser(['contact_messages.view', 'contact_messages.update']);
        $assignee = User::create([
            'name' => 'Assigned Staff',
            'email' => 'assigned-staff@example.org',
            'password' => 'secret-password',
            'preferred_locale' => 'en',
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);
        $message = ContactMessage::create([
            'name' => 'Grace Talla',
            'email' => 'grace@example.org',
            'reason' => 'assistance',
            'message' => 'Please help us understand how to request school assistance.',
            'locale' => 'en',
            'status' => 'new',
        ]);

        Sanctum::actingAs($staff);

        $this->patchJson("/api/v1/contact-messages/{$message->uuid}/assignment", [
            'assigned_to' => $assignee->id,
        ])->assertOk()
            ->assertJsonPath('message', 'Contact inquiry assignment updated.')
            ->assertJsonPath('data.handler.id', $assignee->id)
            ->assertJsonPath('data.status', 'reviewing');

        $this->assertDatabaseHas('contact_messages', [
            'id' => $message->id,
            'handled_by' => $assignee->id,
            'status' => 'reviewing',
        ]);
        $this->assertNotNull($message->fresh()->reviewed_at);
    }

    public function test_staff_can_forward_contact_message_without_public_attachment_exposure(): void
    {
        Mail::fake();

        $staff = $this->staffUser(['contact_messages.view', 'contact_messages.update']);
        $message = ContactMessage::create([
            'name' => 'School Lead',
            'email' => 'school-lead@example.org',
            'phone' => '+237600000000',
            'reason' => 'school',
            'subject' => 'Student support',
            'message' => 'A school representative is asking about support for students.',
            'locale' => 'en',
            'status' => 'new',
        ]);

        Sanctum::actingAs($staff);

        $this->postJson("/api/v1/contact-messages/{$message->uuid}/forward", [
            'to_email' => 'programs@example.org',
            'note' => 'Please review this school inquiry today.',
        ])->assertOk()
            ->assertJsonPath('message', 'Contact inquiry sent successfully.')
            ->assertJsonPath('data.status', 'reviewing')
            ->assertJsonPath('data.handler.id', $staff->id);

        Mail::assertSent(ContactMessageForwarded::class, function (ContactMessageForwarded $mail): bool {
            return $mail->hasTo('programs@example.org')
                && $mail->note === 'Please review this school inquiry today.'
                && $mail->contactMessage->email === 'school-lead@example.org';
        });

        $message->refresh();
        $this->assertSame('reviewing', $message->status);
        $this->assertSame($staff->id, $message->handled_by);
        $this->assertStringContainsString('Forwarded to programs@example.org', $message->staff_notes);
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function staffUser(array $permissions): User
    {
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web'],
                ['group' => 'contact_messages'],
            );
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $user = User::create([
            'name' => 'Contact Staff',
            'email' => fake()->unique()->safeEmail(),
            'password' => 'secret-password',
            'preferred_locale' => 'en',
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);

        $user->givePermissionTo($permissions);

        return $user;
    }
}
