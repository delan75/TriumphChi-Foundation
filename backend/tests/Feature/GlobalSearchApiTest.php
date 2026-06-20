<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Enums\BeneficiaryStatus;
use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Donor;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Lang;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class GlobalSearchApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_global_search_requires_authentication(): void
    {
        $this->getJson('/api/v1/global-search?q=amina')
            ->assertUnauthorized();
    }

    public function test_global_search_requires_a_meaningful_query(): void
    {
        $this->actingWithPermissions('beneficiaries.view');

        $this->getJson('/api/v1/global-search?q=a')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('q');
    }

    public function test_global_search_returns_only_the_resources_the_user_can_view(): void
    {
        [$application, $beneficiary] = $this->seedSearchRecords();

        $this->actingWithPermissions('beneficiaries.view');

        $response = $this->getJson('/api/v1/global-search?q=amina&limit=10')
            ->assertOk()
            ->assertJsonPath('message', __('api.search.retrieved'))
            ->assertJsonPath('data.meta.returned', 1)
            ->assertJsonPath('data.meta.group_count', 1)
            ->assertJsonPath('data.groups.0.key', 'beneficiaries')
            ->assertJsonPath('data.results.0.resource', 'beneficiaries')
            ->assertJsonPath('data.results.0.reference', $beneficiary->internal_id)
            ->assertJsonPath('data.results.0.title', 'Amina Fonyuy');

        $this->assertSame([$beneficiary->uuid], array_column($response->json('data.results'), 'id'));
        $this->assertNotContains($application->application_number, array_column($response->json('data.results'), 'reference'));
    }

    public function test_global_search_localizes_group_and_status_labels(): void
    {
        [, $beneficiary] = $this->seedSearchRecords();

        $this->actingWithPermissions('beneficiaries.view');

        $this->withHeader('Accept-Language', 'fr')
            ->getJson('/api/v1/global-search?q=amina')
            ->assertOk()
            ->assertJsonPath('message', Lang::get('api.search.retrieved', [], 'fr'))
            ->assertJsonPath('data.groups.0.label', Lang::get('api.search.groups.beneficiaries', [], 'fr'))
            ->assertJsonPath(
                'data.results.0.status_label',
                Lang::get('labels.beneficiary_statuses.'.$beneficiary->status->value, [], 'fr'),
            );
    }

    private function actingWithPermissions(string ...$permissions): User
    {
        $user = User::create([
            'name' => 'Search User',
            'email' => 'search-user-'.uniqid('', true).'@example.test',
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

    private function seedSearchRecords(): array
    {
        $school = School::create([
            'code' => 'SCH-SEARCH-001',
            'name' => 'Hope Bilingual School',
            'verification_status' => 'verified',
        ]);

        $application = Application::create([
            'application_number' => 'APP-SEARCH-001',
            'source' => 'school',
            'status' => ApplicationStatus::Submitted,
            'applicant_name' => 'Amina Applicant',
            'guardian_name' => 'Grace Applicant',
            'school_id' => $school->id,
            'submitted_at' => now(),
        ]);

        $beneficiary = Beneficiary::create([
            'internal_id' => 'BEN-SEARCH-001',
            'school_id' => $school->id,
            'status' => BeneficiaryStatus::ActiveSupport,
            'first_name' => 'Amina',
            'last_name' => 'Fonyuy',
            'guardian_name' => 'Grace Fonyuy',
        ]);

        Donor::create([
            'name' => 'Amina Community Trust',
            'email' => 'donor-search@example.test',
            'type' => 'organization',
            'status' => 'active',
        ]);

        return [$application, $beneficiary];
    }
}
