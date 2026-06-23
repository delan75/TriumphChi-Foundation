<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\Region;
use App\Models\School;
use App\Models\Village;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\LaravelPdf\Facades\Pdf;
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
                'school_enrollment_status' => 'enrolled',
                'need_type' => 'fees',
                'need_summary' => 'School fees are due and the child cannot remain in class without support.',
                'situation_summary' => 'The child is at risk of missing school because the family cannot cover the current term fees.',
                'fee_amount' => '45000',
                'fee_due_date' => '2026-09-15',
                'household_income_range' => 'Below XAF 50,000',
                'household_size' => 6,
                'primary_caregiver_occupation' => 'Farmer',
                'household_challenges' => ['loss of parent', 'unstable income'],
                'contact_role' => 'guardian',
                'contact_name' => 'Mimi Talla',
                'contact_phone' => '+237 600 000 000',
                'contact_email' => 'guardian@gmail.com',
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
        $this->assertNotNull($application->region_id);
        $this->assertNotNull($application->village_id);
        $this->assertNotNull($application->school_id);
        $this->assertSame('fr', $application->intake_payload['locale']);
        $this->assertSame('fees', $application->intake_payload['need_type']);
        $this->assertSame('phone', $application->intake_payload['preferred_contact_method']);
        $this->assertSame('Below XAF 50,000', $application->household_income_range);
        $this->assertSame(6, $application->household_size);
        $this->assertSame('Farmer', $application->primary_caregiver_occupation);
        $this->assertSame(['loss of parent', 'unstable income'], $application->household_challenges);
        $this->assertSame('45000', $application->intake_payload['fee_amount']);
        $this->assertSame('enrolled', $application->intake_payload['school_enrollment_status']);
        $this->assertDatabaseHas('applications', [
            'applicant_name' => 'Grace Talla',
            'guardian_name' => 'Mimi Talla',
            'guardian_phone' => '+237 600 000 000',
            'source' => 'online',
            'status' => ApplicationStatus::Submitted->value,
        ]);
        $this->assertDatabaseHas('regions', ['name' => 'North West']);
        $this->assertDatabaseHas('villages', ['name' => 'Bamenda']);
        $this->assertDatabaseHas('schools', ['name' => 'Government Bilingual Primary School']);
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

    public function test_public_application_accepts_teacher_verification_contact(): void
    {
        $this->postJson('/api/v1/public/applications', [
            'child_name' => 'Junior Neba',
            'school_enrollment_status' => 'not_enrolled',
            'last_school_attended' => 'Village Primary School',
            'education_interruption_reason' => 'Fees were not paid before the new term.',
            'need_type' => 'exam',
            'need_summary' => 'The child needs examination support.',
            'situation_summary' => 'The teacher can help confirm the records and exam date.',
            'exam_name' => 'Common Entrance',
            'exam_fee_amount' => '25000',
            'contact_role' => 'teacher',
            'teacher_school_name' => 'Village Primary School',
            'teacher_position' => 'Class teacher',
            'contact_name' => 'Mr. Tabi',
            'contact_phone' => '+237 677 000 000',
            'preferred_contact_method' => 'whatsapp',
            'consent' => true,
        ])->assertCreated()
            ->assertJsonPath('success', true);

        $application = Application::query()->firstOrFail();

        $this->assertSame('teacher', $application->intake_payload['contact_role']);
        $this->assertSame('Village Primary School', $application->intake_payload['teacher_school_name']);
        $this->assertSame('Class teacher', $application->intake_payload['teacher_position']);
        $this->assertSame('Common Entrance', $application->intake_payload['exam_name']);
    }

    public function test_public_application_accepts_long_need_and_situation_summaries(): void
    {
        $needSummary = str_repeat('N', 5000);
        $situationSummary = str_repeat('S', 7000);

        $this->postJson('/api/v1/public/applications', [
            'child_name' => 'Long Story Child',
            'need_type' => 'fees',
            'need_summary' => $needSummary,
            'situation_summary' => $situationSummary,
            'contact_role' => 'guardian',
            'contact_name' => 'Responsible Guardian',
            'contact_phone' => '+237 677 111 222',
            'preferred_contact_method' => 'phone',
            'consent' => true,
        ])->assertCreated()
            ->assertJsonPath('success', true);

        $application = Application::query()->firstOrFail();

        $this->assertSame($needSummary, $application->intake_payload['need_summary']);
        $this->assertSame($situationSummary, $application->intake_payload['situation_summary']);
    }

    public function test_public_application_pdf_preview_merges_saved_draft_and_current_payload(): void
    {
        $pdf = Pdf::fake();

        $application = Application::create([
            'source' => 'online',
            'status' => ApplicationStatus::Draft,
            'applicant_name' => 'Saved Child',
            'guardian_name' => 'Saved Guardian',
            'guardian_phone' => '+237 600 123 123',
            'needs_assessment' => 'Saved need summary',
            'draft_token' => 'draft-preview-token',
            'intake_payload' => [
                'school_name' => 'Saved School',
                'need_type' => 'fees',
            ],
        ]);

        $application->steps()->create([
            'step_number' => 1,
            'data' => [
                'region_name' => 'Saved Region',
                'village_name' => 'Saved Village',
            ],
            'completed_at' => now(),
        ]);

        $this->postJson('/api/v1/public/applications/preview-pdf', [
            'draft_token' => 'draft-preview-token',
            'child_name' => 'Current Child',
            'situation_summary' => 'Current situation summary from the final review step.',
        ])->assertOk();

        $pdf->assertRespondedWithPdf(function ($generatedPdf): bool {
            return $generatedPdf->viewName === 'pdf.application_summary'
                && data_get($generatedPdf->viewData, 'isPreview') === true
                && data_get($generatedPdf->viewData, 'data.child_name') === 'Current Child'
                && data_get($generatedPdf->viewData, 'data.school_name') === 'Saved School'
                && data_get($generatedPdf->viewData, 'data.region_name') === 'Saved Region'
                && data_get($generatedPdf->viewData, 'data.situation_summary') === 'Current situation summary from the final review step.';
        });
    }

    public function test_public_lookup_returns_school_suggestions(): void
    {
        $region = Region::create([
            'name' => 'North West',
            'code' => 'REG-NW',
            'status' => 'active',
        ]);

        $village = Village::create([
            'region_id' => $region->id,
            'name' => 'Bamenda',
            'status' => 'active',
        ]);

        School::create([
            'code' => 'SCH-BAM-001',
            'name' => 'Government Bilingual Primary School',
            'region_id' => $region->id,
            'village_id' => $village->id,
            'verification_status' => 'pending',
        ]);

        $this->withHeader('Accept-Language', 'fr')
            ->getJson('/api/v1/public/lookups/schools?q=government')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.type', 'schools')
            ->assertJsonPath('data.count', 1)
            ->assertJsonPath('data.results.0.label', 'Government Bilingual Primary School');
    }
}
