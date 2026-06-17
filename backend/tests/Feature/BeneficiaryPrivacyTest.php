<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class BeneficiaryPrivacyTest extends TestCase
{
    use RefreshDatabase;

    public function test_beneficiary_index_requires_authentication(): void
    {
        $this->getJson('/api/v1/beneficiaries')
            ->assertUnauthorized();
    }

    public function test_beneficiary_index_requires_view_permission(): void
    {
        Sanctum::actingAs(User::create([
            'name' => 'Field User',
            'email' => 'field@example.org',
            'password' => 'password',
        ]));

        $this->getJson('/api/v1/beneficiaries')
            ->assertForbidden();
    }

    public function test_beneficiary_index_allows_user_with_view_permission(): void
    {
        $user = User::create([
            'name' => 'NGO Staff',
            'email' => 'staff@example.org',
            'password' => 'password',
        ]);

        Permission::create([
            'name' => 'beneficiaries.view',
            'guard_name' => 'web',
            'group' => 'beneficiaries',
        ]);

        $user->givePermissionTo('beneficiaries.view');
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->assertTrue($user->fresh()->can('beneficiaries.view'));

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/beneficiaries')
            ->assertOk();
    }
}

