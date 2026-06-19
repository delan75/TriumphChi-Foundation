<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_token_without_elevated_permissions(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New API User',
            'email' => 'new-api-user@example.org',
            'password' => 'secure-password',
            'password_confirmation' => 'secure-password',
            'preferred_locale' => 'fr',
            'device_name' => 'Postman',
        ])->assertCreated()
            ->assertJsonPath('message', 'Registration successful.')
            ->assertJsonPath('token.token_type', 'Bearer')
            ->assertJsonPath('user.email', 'new-api-user@example.org')
            ->assertJsonPath('user.preferred_locale', 'fr')
            ->assertJsonPath('user.roles', [])
            ->assertJsonPath('user.permissions', []);

        $this->assertNotEmpty($response->json('token.access_token'));
        $this->assertDatabaseHas('users', [
            'email' => 'new-api-user@example.org',
            'preferred_locale' => 'fr',
            'registered_via' => 'local',
        ]);
        $this->assertDatabaseHas('user_auth_providers', [
            'user_id' => $response->json('user.id'),
            'provider' => 'local',
        ]);
        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->withToken($response->json('token.access_token'))
            ->getJson('/api/v1/beneficiaries')
            ->assertForbidden();
    }

    public function test_register_rejects_duplicate_email_addresses(): void
    {
        User::create([
            'name' => 'Existing User',
            'email' => 'existing-user@example.org',
            'password' => 'secure-password',
            'preferred_locale' => 'en',
        ]);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Duplicate User',
            'email' => 'existing-user@example.org',
            'password' => 'secure-password',
            'password_confirmation' => 'secure-password',
            'preferred_locale' => 'en',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_role_permission_seeder_creates_super_admin_with_all_permissions(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::where('email', 'admin@triumphchi.org')->firstOrFail();

        $this->assertTrue($admin->hasRole('super_administrator'));
        $this->assertTrue($admin->can('beneficiaries.delete'));
        $this->assertTrue($admin->can('permissions.manage'));
        $this->assertTrue($admin->can('future.permission.added.later'));
        $this->assertDatabaseHas('user_auth_providers', [
            'user_id' => $admin->id,
            'provider' => 'local',
        ]);
    }

    public function test_seeded_super_admin_can_login_and_access_protected_routes(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $token = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@triumphchi.org',
            'password' => 'password',
            'device_name' => 'API Client',
        ])->assertOk()
            ->assertJsonPath('user.roles.0', 'super_administrator')
            ->assertJsonPath('user.permissions.0', 'allocations.create')
            ->json('token.access_token');

        $this->withToken($token)
            ->getJson('/api/v1/beneficiaries')
            ->assertOk();
    }

    public function test_user_can_login_and_receive_permission_context(): void
    {
        $user = $this->createUserWithPermissions();

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'secret-password',
            'device_name' => 'Thunder Client',
        ])->assertOk()
            ->assertJsonPath('token.token_type', 'Bearer')
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('user.roles.0', 'ngo_staff')
            ->assertJsonPath('user.permissions.0', 'beneficiaries.view');

        $this->assertNotEmpty($response->json('token.access_token'));
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertNotNull($user->fresh()->last_login_at);
        $this->assertDatabaseHas('user_auth_providers', [
            'user_id' => $user->id,
            'provider' => 'local',
        ]);
    }

    public function test_invalid_login_returns_localized_validation_error(): void
    {
        $user = User::create([
            'name' => 'Invalid Login User',
            'email' => 'invalid-login@example.org',
            'password' => 'secret-password',
            'preferred_locale' => 'fr',
        ]);

        $this->withHeader('Accept-Language', 'fr')
            ->postJson('/api/v1/auth/login', [
                'email' => $user->email,
                'password' => 'wrong-password',
                'device_name' => 'API Client',
            ])->assertUnprocessable()
            ->assertJsonValidationErrors('email')
            ->assertSee('identifiants');
    }

    public function test_api_auth_failures_return_json_without_accept_header(): void
    {
        $user = User::create([
            'name' => 'Plain Client User',
            'email' => 'plain-client@example.org',
            'password' => 'secret-password',
            'preferred_locale' => 'en',
        ]);

        $this->post('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertUnprocessable()
            ->assertHeader('content-type', 'application/json')
            ->assertJsonValidationErrors('email');

        $this->get('/api/v1/auth/me')
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json');
    }

    public function test_login_returns_json_without_accept_header(): void
    {
        $user = $this->createUserWithPermissions();

        $this->post('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'secret-password',
            'device_name' => 'Plain Client',
        ])->assertOk()
            ->assertHeader('content-type', 'application/json')
            ->assertJsonPath('token.token_type', 'Bearer')
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_bearer_token_can_access_me_and_permission_protected_routes(): void
    {
        $user = $this->createUserWithPermissions();
        $token = $this->loginToken($user);

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonPath('data.permissions.0', 'beneficiaries.view');

        $this->withToken($token)
            ->getJson('/api/v1/beneficiaries')
            ->assertOk();
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = $this->createUserWithPermissions();
        $token = $this->loginToken($user);

        $this->withToken($token)
            ->postJson('/api/v1/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Current access token revoked.');

        $this->assertDatabaseCount('personal_access_tokens', 0);

        auth()->forgetGuards();

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    }

    public function test_logout_all_revokes_every_user_token(): void
    {
        $user = $this->createUserWithPermissions();
        $firstToken = $user->createToken('first-client')->plainTextToken;
        $secondToken = $user->createToken('second-client')->plainTextToken;

        $this->assertDatabaseCount('personal_access_tokens', 2);

        $this->withToken($firstToken)
            ->postJson('/api/v1/auth/logout-all')
            ->assertOk()
            ->assertJsonPath('message', 'All access tokens revoked.');

        $this->assertDatabaseCount('personal_access_tokens', 0);

        auth()->forgetGuards();

        $this->withToken($secondToken)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    }

    public function test_provider_listing_and_unlinking_preserve_one_sign_in_method(): void
    {
        $user = $this->createUserWithPermissions();
        $user->authProviders()->firstOrCreate(['provider' => 'local'], ['linked_at' => now()]);
        $token = $this->loginToken($user);

        $this->withToken($token)
            ->getJson('/api/v1/auth/social/providers')
            ->assertOk()
            ->assertJsonPath('data.0.provider', 'local');

        $this->withToken($token)
            ->deleteJson('/api/v1/auth/social/local')
            ->assertStatus(422)
            ->assertJsonPath('message', 'At least one sign-in method must remain connected.');
    }

    private function createUserWithPermissions(): User
    {
        $permission = Permission::firstOrCreate(
            ['name' => 'beneficiaries.view', 'guard_name' => 'web'],
            ['group' => 'beneficiaries'],
        );

        $role = Role::firstOrCreate(
            ['name' => 'ngo_staff', 'guard_name' => 'web'],
            ['label' => 'NGO Staff'],
        );

        $role->syncPermissions([$permission]);

        $user = User::create([
            'name' => 'API User',
            'email' => fake()->unique()->safeEmail(),
            'password' => 'secret-password',
            'preferred_locale' => 'en',
        ]);

        $user->assignRole($role);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $user;
    }

    private function loginToken(User $user): string
    {
        return $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'secret-password',
            'device_name' => 'API Client',
        ])->assertOk()
            ->json('token.access_token');
    }
}
