<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

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
