<?php

namespace Tests\Feature;

use App\Enums\BeneficiaryStatus;
use App\Models\Beneficiary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ApiLocalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_resources_include_localized_labels_from_explicit_request_locale(): void
    {
        $user = User::create([
            'name' => 'Localized User',
            'email' => 'localized@example.org',
            'password' => 'password',
            'preferred_locale' => 'en',
        ]);

        Permission::create([
            'name' => 'beneficiaries.view',
            'guard_name' => 'web',
            'group' => 'beneficiaries',
        ]);

        $user->givePermissionTo('beneficiaries.view');
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Beneficiary::create([
            'internal_id' => 'BEN-LOC-001',
            'status' => BeneficiaryStatus::ActiveSupport,
            'first_name' => 'Aline',
            'last_name' => 'Mballa',
            'region' => 'Centre',
            'village' => 'Obala',
        ]);

        Sanctum::actingAs($user);

        $this->withHeaders(['X-Locale' => 'fr'])
            ->getJson('/api/v1/beneficiaries')
            ->assertOk()
            ->assertHeader('Content-Language', 'fr')
            ->assertJsonPath('data.0.status', 'active_support')
            ->assertJsonPath('data.0.status_label', 'Soutien actif');
    }

    public function test_user_preferred_locale_is_used_when_request_has_no_locale(): void
    {
        $user = User::create([
            'name' => 'French User',
            'email' => 'french@example.org',
            'password' => 'password',
            'preferred_locale' => 'fr',
        ]);

        Permission::create([
            'name' => 'beneficiaries.view',
            'guard_name' => 'web',
            'group' => 'beneficiaries',
        ]);

        $user->givePermissionTo('beneficiaries.view');
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Beneficiary::create([
            'internal_id' => 'BEN-LOC-002',
            'status' => BeneficiaryStatus::AwaitingSponsorship,
            'first_name' => 'Marie',
            'last_name' => 'Ngo',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/beneficiaries')
            ->assertOk()
            ->assertHeader('Content-Language', 'fr')
            ->assertJsonPath('data.0.status', 'awaiting_sponsorship')
            ->assertJsonPath('data.0.status_label', 'En attente de parrainage');
    }

    public function test_accept_language_localizes_public_api_requests(): void
    {
        $this->withHeaders(['Accept-Language' => 'fr-CM,fr;q=0.9,en;q=0.8'])
            ->getJson('/api/v1/health')
            ->assertOk()
            ->assertHeader('Content-Language', 'fr');
    }
}
