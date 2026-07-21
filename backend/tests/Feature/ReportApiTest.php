<?php

namespace Tests\Feature;

use App\Enums\BeneficiaryStatus;
use App\Enums\NeedStatus;
use App\Models\Beneficiary;
use App\Models\EducationalNeed;
use App\Models\Region;
use App\Models\ReportRequest;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ReportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_dashboard_requires_authentication(): void
    {
        $this->getJson('/api/v1/reports/dashboard')
            ->assertUnauthorized();
    }

    public function test_report_dashboard_is_permission_and_data_aware(): void
    {
        $seed = $this->seedReportRecords();
        $this->actingWithPermissions('reports.view', 'beneficiaries.view', 'funds.view');

        $response = $this->getJson('/api/v1/reports/dashboard')
            ->assertOk()
            ->assertJsonPath('message', __('api.reports.dashboard_retrieved'));

        $templateKeys = array_column($response->json('data.templates'), 'key');
        $regionValues = array_column($response->json('data.filter_options.regions'), 'value');
        $yearValues = array_column($response->json('data.filter_options.academic_years'), 'value');
        $fundingValues = array_column($response->json('data.filter_options.funding_statuses'), 'value');

        $this->assertContains('beneficiary-summary', $templateKeys);
        $this->assertContains('funding-gap', $templateKeys);
        $this->assertNotContains('school-payments', $templateKeys);
        $this->assertContains((string) $seed['region']->id, $regionValues);
        $this->assertContains('2026', $yearValues);
        $this->assertContains('funding_gap', $fundingValues);
    }

    public function test_report_request_is_queued_with_available_filters_only(): void
    {
        $seed = $this->seedReportRecords();
        $user = $this->actingWithPermissions('reports.view', 'beneficiaries.view');

        $this->postJson('/api/v1/reports/generate', [
            'template_key' => 'beneficiary-summary',
            'format' => 'PDF',
            'filters' => [
                'region_id' => (string) $seed['region']->id,
                'academic_year' => '2026',
                'support_status' => BeneficiaryStatus::ActiveSupport->value,
                'funding_status' => 'funding_gap',
            ],
            'fields' => ['Name', 'School', 'Funding Status'],
        ])
            ->assertCreated()
            ->assertJsonPath('message', __('api.reports.request_queued'))
            ->assertJsonPath('data.status', 'queued')
            ->assertJsonPath('data.progress', 5);

        $this->assertDatabaseHas('report_requests', [
            'requested_by' => $user->id,
            'template_key' => 'beneficiary-summary',
            'status' => 'queued',
        ]);
    }

    public function test_report_request_rejects_unavailable_filters(): void
    {
        $this->seedReportRecords();
        $this->actingWithPermissions('reports.view', 'beneficiaries.view');

        $this->postJson('/api/v1/reports/generate', [
            'template_key' => 'beneficiary-summary',
            'format' => 'PDF',
            'filters' => [
                'academic_year' => '2039',
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonPath('message', __('api.reports.request_invalid'))
            ->assertJsonValidationErrors('filters.academic_year');

        $this->assertSame(0, ReportRequest::count());
    }

    private function actingWithPermissions(string ...$permissions): User
    {
        $user = User::create([
            'name' => 'Reports User',
            'email' => 'reports-user-'.uniqid('', true).'@example.test',
            'password' => 'password',
        ]);

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web'],
                ['group' => str($permission)->before('.')->toString()],
            );
        }

        $user->givePermissionTo($permissions);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        Sanctum::actingAs($user);

        return $user;
    }

    private function seedReportRecords(): array
    {
        $region = Region::create([
            'code' => 'REG-RPT',
            'name' => 'Report Region',
        ]);

        $school = School::create([
            'code' => 'SCH-RPT',
            'name' => 'Report School',
            'region_id' => $region->id,
            'verification_status' => 'verified',
        ]);

        $beneficiary = Beneficiary::create([
            'internal_id' => 'BEN-RPT-001',
            'school_id' => $school->id,
            'region_id' => $region->id,
            'status' => BeneficiaryStatus::ActiveSupport,
            'first_name' => 'Report',
            'last_name' => 'Child',
            'education_level' => 'Form 2',
            'admission_date' => now()->toDateString(),
        ]);

        EducationalNeed::create([
            'beneficiary_id' => $beneficiary->id,
            'type' => 'school_fees',
            'title' => 'School fees',
            'amount_required' => 100000,
            'amount_funded' => 20000,
            'status' => NeedStatus::PartiallyFunded,
            'academic_year' => '2026',
        ]);

        return [
            'region' => $region,
            'school' => $school,
            'beneficiary' => $beneficiary,
        ];
    }
}
