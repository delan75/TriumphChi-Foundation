<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicApplicationIntakeTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_application_can_be_submitted_and_localized(): void
    {
        $response = $this->withHeader('Accept-Language', 'fr')
            ->postJson('/api/v1/public/applications', [
                'child_name' => 'Grace Talla',
                'gender' => 'female',
                'date_of_birth' => '2014-05-21',
                'school_name' => 'Government Bilingual Primary School',
                'grade_level' => 'Primary 5',
                'region_name' => 'North West',
                'village_name' => 'Bamenda',
                'need_type' => 'fees',
                'need_summary' => 'School fees are due and the child cannot remain in class without support.',
                'situation_summary' => 'The child is at risk of missing school because the family cannot cover the current term fees.',
                'contact_role' => 'guardian',
                'contact_name' => 'Mimi Talla',
                'contact_phone' => '+237 600 000 000',
                'contact_email' => 'guardian@example.org',
                'preferred_contact_method' => 'phone',
                'consent' => true,
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Merci. Votre demande a été reçue et sera examinée.')
            ->assertJsonPath('data.application_number', fn (string $value) => str_starts_with($value, 'APP-'))
            ->assertJsonPath('data.submitted_at', fn (?string $value) => is_string($value) && $value !== '');

        $application = Application::query()->firstOrFail();

        $this->assertSame('Grace Talla', $application->applicant_name);
        $this->assertSame('Mimi Talla', $application->guardian_name);
        $this->assertSame('+237 600 000 000', $application->guardian_phone);
        $this->assertSame(ApplicationStatus::Submitted, $application->status);
        $this->assertSame('fr', $application->intake_payload['locale']);
        $this->assertSame('fees', $application->intake_payload['need_type']);
        $this->assertSame('phone', $application->intake_payload['preferred_contact_method']);
        $this->assertDatabaseHas('applications', [
            'applicant_name' => 'Grace Talla',
            'guardian_name' => 'Mimi Talla',
            'guardian_phone' => '+237 600 000 000',
            'source' => 'online',
            'status' => ApplicationStatus::Submitted->value,
        ]);
    }

    public function test_public_application_requires_the_child_and_contact_details(): void
    {
        $this->postJson('/api/v1/public/applications', [
            'child_name' => '',
            'need_type' => 'fees',
            'need_summary' => '',
            'situation_summary' => '',
            'contact_role' => 'guardian',
            'contact_name' => '',
            'contact_phone' => '',
            'preferred_contact_method' => 'phone',
            'consent' => false,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors([
                'child_name',
                'need_summary',
                'situation_summary',
                'contact_name',
                'contact_phone',
                'consent',
            ]);
    }
}
