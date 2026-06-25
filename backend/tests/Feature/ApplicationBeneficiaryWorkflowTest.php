<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Enums\BeneficiaryStatus;
use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Region;
use App\Models\School;
use App\Models\User;
use App\Services\ApplicationBeneficiaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ApplicationBeneficiaryWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_accepting_application_creates_linked_beneficiary_case(): void
    {
        $application = $this->makeReviewPendingApplication();
        $user = $this->staffUser(['applications.verify', 'applications.view', 'beneficiaries.view']);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/v1/applications/{$application->uuid}/status", [
            'status' => ApplicationStatus::Accepted->value,
            'notes' => 'Approved after verification.',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.status', ApplicationStatus::Accepted->value)
            ->assertJsonPath('data.beneficiary.status', BeneficiaryStatus::ActiveSupport->value);

        $beneficiary = Beneficiary::query()->where('application_id', $application->id)->firstOrFail();

        $this->assertSame($application->school_id, $beneficiary->school_id);
        $this->assertSame($application->region_id, $beneficiary->region_id);
        $this->assertSame('Grace', $beneficiary->first_name);
        $this->assertSame('Neba T.', $beneficiary->last_name);
        $this->assertSame('Form 2', $beneficiary->education_level);
        $this->assertSame(BeneficiaryStatus::ActiveSupport, $beneficiary->status);
        $this->assertDatabaseHas('beneficiary_status_history', [
            'beneficiary_id' => $beneficiary->id,
            'to_status' => BeneficiaryStatus::ActiveSupport->value,
            'reason' => 'application_accepted',
        ]);
        $this->assertDatabaseHas('educational_needs', [
            'beneficiary_id' => $beneficiary->id,
            'type' => 'fees',
            'amount_required' => '75000.00',
            'status' => 'open',
        ]);
    }

    public function test_acceptance_beneficiary_creation_is_idempotent(): void
    {
        $application = $this->makeReviewPendingApplication();
        $application->update(['status' => ApplicationStatus::Accepted]);
        $service = app(ApplicationBeneficiaryService::class);

        $first = $service->createFromAcceptedApplication($application);
        $second = $service->createFromAcceptedApplication($application);

        $this->assertTrue($first->is($second));
        $this->assertSame(1, Beneficiary::query()->where('application_id', $application->id)->count());
        $this->assertSame(1, $first->needs()->count());
    }

    public function test_beneficiaries_cannot_be_created_independently(): void
    {
        $user = $this->staffUser(['beneficiaries.create']);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/beneficiaries', [
            'first_name' => 'Standalone',
            'last_name' => 'Child',
            'status' => BeneficiaryStatus::ActiveSupport->value,
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('beneficiaries', 0);
    }

    private function makeReviewPendingApplication(): Application
    {
        $region = Region::create([
            'code' => uniqid('REG-'),
            'name' => 'North West '.uniqid(),
        ]);

        $school = School::create([
            'code' => uniqid('SCH-WF-'),
            'name' => 'Government School Bamenda',
            'region_id' => $region->id,
        ]);

        $application = Application::create([
            'source' => 'online',
            'status' => ApplicationStatus::ReviewPending,
            'applicant_name' => 'Grace Neba T.',
            'gender' => 'female',
            'date_of_birth' => now()->subYears(13)->toDateString(),
            'guardian_name' => 'Auntie Neba',
            'guardian_phone' => '+237 670 111 222',
            'region_id' => $region->id,
            'school_id' => $school->id,
            'needs_assessment' => 'School fees are required before the child can continue.',
            'submitted_at' => now()->subDays(7),
            'verified_at' => now()->subDays(2),
        ]);

        $application->educationDetails()->create([
            'is_currently_enrolled' => true,
            'school_name' => 'Government School Bamenda',
            'grade_level' => 'Form 2',
        ]);

        $application->needAssessments()->create([
            'need_type' => 'fees',
            'urgency' => 'high',
            'description' => 'Term school fees.',
            'estimated_cost' => 75000,
        ]);

        return $application;
    }

    private function staffUser(array $permissions): User
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

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
