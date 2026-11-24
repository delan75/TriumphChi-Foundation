<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\Region;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ApplicationStatusHistoryAndNotesTest extends TestCase
{
    use RefreshDatabase;

    public function test_transition_with_default_internal_note_does_not_leak_to_public_tracking(): void
    {
        $application = $this->createSubmittedApplication();
        $staff = $this->staffUser(['applications.verify', 'applications.view']);

        Sanctum::actingAs($staff);

        $response = $this->patchJson("/api/v1/applications/{$application->uuid}/status", [
            'status' => ApplicationStatus::VerificationPending->value,
            'notes' => 'Internal check: Guardian phone number needs follow-up.',
            // is_public omitted: must default to false
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', ApplicationStatus::VerificationPending->value)
            ->assertJsonPath('data.verification_notes', 'Internal check: Guardian phone number needs follow-up.')
            ->assertJsonPath('data.public_comment', null)
            ->assertJsonPath('data.status_history.0.from_status', 'submitted')
            ->assertJsonPath('data.status_history.0.to_status', 'verification_pending')
            ->assertJsonPath('data.status_history.0.is_public', false)
            ->assertJsonPath('data.status_history.0.changed_by.id', $staff->id)
            ->assertJsonPath('data.notes.0.is_public', false)
            ->assertJsonPath('data.notes.0.stage', 'verification_pending');

        $this->assertDatabaseHas('application_status_history', [
            'application_id' => $application->id,
            'from_status' => 'submitted',
            'to_status' => 'verification_pending',
            'notes' => 'Internal check: Guardian phone number needs follow-up.',
            'is_public' => false,
            'changed_by' => $staff->id,
        ]);

        $this->assertDatabaseHas('application_notes', [
            'application_id' => $application->id,
            'note' => 'Internal check: Guardian phone number needs follow-up.',
            'is_public' => false,
            'user_id' => $staff->id,
        ]);

        // Verify public tracking endpoint NEVER leaks internal note
        $trackingResponse = $this->getJson('/api/v1/public/applications/track?' . http_build_query([
            'application_number' => $application->application_number,
            'email' => 'guardian@example.com',
        ]));

        $trackingResponse->assertOk()
            ->assertJsonPath('data.status', 'verification_pending')
            ->assertJsonPath('data.public_comment', null)
            ->assertJsonPath('data.verification_notes', null);
    }

    public function test_transition_with_public_note_is_visible_on_public_tracking(): void
    {
        $application = $this->createSubmittedApplication();
        $staff = $this->staffUser(['applications.verify', 'applications.view']);

        Sanctum::actingAs($staff);

        $response = $this->patchJson("/api/v1/applications/{$application->uuid}/status", [
            'status' => ApplicationStatus::VerificationPending->value,
            'notes' => 'We have received your application and will contact your village chief next week.',
            'is_public' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', ApplicationStatus::VerificationPending->value)
            ->assertJsonPath('data.public_comment', 'We have received your application and will contact your village chief next week.')
            ->assertJsonPath('data.status_history.0.is_public', true)
            ->assertJsonPath('data.notes.0.is_public', true);

        $this->assertDatabaseHas('application_status_history', [
            'application_id' => $application->id,
            'is_public' => true,
        ]);

        // Verify public tracking endpoint returns the public comment
        $trackingResponse = $this->getJson('/api/v1/public/applications/track?' . http_build_query([
            'application_number' => $application->application_number,
            'email' => 'guardian@example.com',
        ]));

        $trackingResponse->assertOk()
            ->assertJsonPath('data.status', 'verification_pending')
            ->assertJsonPath('data.public_comment', 'We have received your application and will contact your village chief next week.')
            ->assertJsonPath('data.verification_notes', 'We have received your application and will contact your village chief next week.');
    }

    public function test_staff_can_add_standalone_internal_and_public_notes(): void
    {
        $application = $this->createSubmittedApplication();
        $staff = $this->staffUser(['applications.verify', 'applications.view']);

        Sanctum::actingAs($staff);

        // 1. Add internal note
        $internalResp = $this->postJson("/api/v1/applications/{$application->uuid}/notes", [
            'note' => 'Internal reviewer observation: Need verification from headmaster.',
            'is_public' => false,
        ]);

        $internalResp->assertCreated()
            ->assertJsonPath('data.notes.0.note', 'Internal reviewer observation: Need verification from headmaster.')
            ->assertJsonPath('data.notes.0.is_public', false);

        $this->assertDatabaseHas('application_notes', [
            'application_id' => $application->id,
            'note' => 'Internal reviewer observation: Need verification from headmaster.',
            'is_public' => false,
            'user_id' => $staff->id,
        ]);

        // Public tracking must not see the internal note
        $this->getJson('/api/v1/public/applications/track?' . http_build_query([
            'application_number' => $application->application_number,
            'email' => 'guardian@example.com',
        ]))
            ->assertOk()
            ->assertJsonPath('data.public_comment', null);

        // 2. Add public note
        $publicResp = $this->postJson("/api/v1/applications/{$application->uuid}/notes", [
            'note' => 'Please provide the missing enrollment certificate when requested.',
            'is_public' => true,
        ]);

        $publicResp->assertCreated()
            ->assertJsonPath('data.public_comment', 'Please provide the missing enrollment certificate when requested.')
            ->assertJsonPath('data.notes.0.note', 'Please provide the missing enrollment certificate when requested.')
            ->assertJsonPath('data.notes.0.is_public', true);

        // Public tracking must see the public note
        $this->getJson('/api/v1/public/applications/track?' . http_build_query([
            'application_number' => $application->application_number,
            'email' => 'guardian@example.com',
        ]))
            ->assertOk()
            ->assertJsonPath('data.public_comment', 'Please provide the missing enrollment certificate when requested.');
    }

    private function createSubmittedApplication(): Application
    {
        $region = Region::create([
            'code' => 'NW-' . uniqid(),
            'name' => 'North West',
        ]);

        $school = School::create([
            'code' => 'SCH-' . uniqid(),
            'name' => 'Government High School',
            'region_id' => $region->id,
        ]);

        return Application::create([
            'source' => 'online',
            'status' => ApplicationStatus::Submitted,
            'applicant_name' => 'John Doe',
            'gender' => 'male',
            'date_of_birth' => '2012-04-10',
            'guardian_name' => 'Mary Doe',
            'guardian_phone' => '+237670000000',
            'region_id' => $region->id,
            'school_id' => $school->id,
            'intake_payload' => [
                'contact_email' => 'guardian@example.com',
            ],
            'submitted_at' => now(),
        ]);
    }

    private function staffUser(array $permissions): User
    {
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        $user = User::create([
            'name' => 'Application Reviewer',
            'email' => uniqid('reviewer').'@example.org',
            'password' => 'password',
            'preferred_locale' => 'en',
            'status' => User::STATUS_ACTIVE,
            'registered_via' => 'local',
            'email_verified_at' => now(),
        ]);

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ], [
                'group' => str($permission)->before('.')->toString(),
            ]);
        }

        $user->givePermissionTo($permissions);

        return $user;
    }
}
