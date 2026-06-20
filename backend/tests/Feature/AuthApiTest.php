<?php

namespace Tests\Feature;

use App\Models\OAuthLoginCode;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_pending_account_without_token_or_elevated_permissions(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New API User',
            'email' => 'new-api-user@example.org',
            'phone' => '+237600000000',
            'password' => 'secure-password',
            'password_confirmation' => 'secure-password',
            'preferred_locale' => 'fr',
            'device_name' => 'Postman',
        ])->assertCreated()
            ->assertJsonPath('message', 'Registration successful. Please verify your email address before signing in.')
            ->assertJsonPath('token', null)
            ->assertJsonPath('user.email', 'new-api-user@example.org')
            ->assertJsonPath('user.phone', '+237600000000')
            ->assertJsonPath('user.preferred_locale', 'fr')
            ->assertJsonPath('user.status', User::STATUS_PENDING)
            ->assertJsonPath('user.roles', [])
            ->assertJsonPath('user.permissions', []);

        $this->assertDatabaseHas('users', [
            'email' => 'new-api-user@example.org',
            'preferred_locale' => 'fr',
            'registered_via' => 'local',
            'status' => User::STATUS_PENDING,
            'email_verified_at' => null,
        ]);
        $this->assertDatabaseHas('user_auth_providers', [
            'user_id' => $response->json('user.id'),
            'provider' => 'local',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $response->json('user.id'),
            'action' => 'registered',
        ]);
        $this->assertDatabaseCount('personal_access_tokens', 0);
        Notification::assertSentTo(User::firstWhere('email', 'new-api-user@example.org'), VerifyEmail::class);
    }

    public function test_pending_user_cannot_login_until_email_is_verified(): void
    {
        $user = User::create([
            'name' => 'Pending User',
            'email' => 'pending-user@example.org',
            'password' => 'secret-password',
            'preferred_locale' => 'en',
            'status' => User::STATUS_PENDING,
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'secret-password',
            'device_name' => 'API Client',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('email')
            ->assertSee('verify your email');

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'failed_login',
        ]);
    }

    public function test_register_rejects_duplicate_email_addresses(): void
    {
        User::create([
            'name' => 'Existing User',
            'email' => 'existing-user@example.org',
            'password' => 'secure-password',
            'preferred_locale' => 'en',
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
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

    public function test_role_permission_seeder_creates_verified_super_admin_with_all_permissions(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::where('email', 'admin@triumphchi.org')->firstOrFail();

        $this->assertTrue($admin->hasRole('super_administrator'));
        $this->assertTrue($admin->can('beneficiaries.delete'));
        $this->assertTrue($admin->can('permissions.manage'));
        $this->assertTrue($admin->can('future.permission.added.later'));
        $this->assertTrue($admin->isActive());
        $this->assertNotNull($admin->email_verified_at);
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
            ->assertJsonPath('token.token_type', 'Bearer')
            ->assertJsonStructure(['token' => ['access_token', 'expires_at']])
            ->json('token.access_token');

        $this->withToken($token)
            ->getJson('/api/v1/beneficiaries')
            ->assertOk();
    }

    public function test_user_can_login_receive_permission_context_and_rotate_same_device_token(): void
    {
        $user = $this->createUserWithPermissions();

        $firstResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'secret-password',
            'device_name' => 'Thunder Client',
        ])->assertOk()
            ->assertJsonPath('token.token_type', 'Bearer')
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('user.roles.0', 'ngo_staff')
            ->assertJsonPath('user.permissions.0', 'beneficiaries.view')
            ->assertJsonStructure(['token' => ['access_token', 'expires_at']]);

        $this->assertNotEmpty($firstResponse->json('token.access_token'));
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertNotNull($user->fresh()->last_login_at);

        $secondToken = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'secret-password',
            'device_name' => 'Thunder Client',
        ])->assertOk()
            ->json('token.access_token');

        $this->assertNotSame($firstResponse->json('token.access_token'), $secondToken);
        $this->assertDatabaseCount('personal_access_tokens', 1);
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
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
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
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
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

    public function test_suspended_account_is_rejected_from_protected_routes(): void
    {
        $user = $this->createUserWithPermissions();
        $token = $this->loginToken($user);

        $user->forceFill(['status' => User::STATUS_SUSPENDED])->save();

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertForbidden()
            ->assertJsonPath('message', 'This account is not active. Please contact support if you believe this is a mistake.');
    }

    public function test_expired_token_is_rejected(): void
    {
        $user = $this->createUserWithPermissions();
        $expiredToken = $user->createToken('expired-client', ['*'], now()->subMinute())->plainTextToken;

        $this->withToken($expiredToken)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
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
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'logout',
        ]);

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
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'logout_all_devices',
        ]);

        auth()->forgetGuards();

        $this->withToken($secondToken)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    }

    public function test_google_redirect_uses_stateless_socialite_flow(): void
    {
        $provider = \Mockery::mock();
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('scopes')
            ->once()
            ->with(['openid', 'profile', 'email'])
            ->andReturnSelf();
        $provider->shouldReceive('redirect')
            ->once()
            ->andReturn(redirect('https://accounts.google.com/o/oauth2/v2/auth'));

        Socialite::shouldReceive('driver')
            ->once()
            ->with('google')
            ->andReturn($provider);

        $this->get('/api/v1/auth/google/redirect')
            ->assertRedirect('https://accounts.google.com/o/oauth2/v2/auth');
    }

    public function test_facebook_redirect_uses_stateless_socialite_flow(): void
    {
        $provider = \Mockery::mock();
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('scopes')
            ->once()
            ->with(['email'])
            ->andReturnSelf();
        $provider->shouldReceive('redirect')
            ->once()
            ->andReturn(redirect('https://www.facebook.com/v23.0/dialog/oauth'));

        Socialite::shouldReceive('driver')
            ->once()
            ->with('facebook')
            ->andReturn($provider);

        $this->get('/api/v1/auth/facebook/redirect')
            ->assertRedirect('https://www.facebook.com/v23.0/dialog/oauth');
    }

    public function test_facebook_callback_creates_oauth_code_without_exposing_sanctum_token(): void
    {
        $provider = \Mockery::mock();
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('user')
            ->once()
            ->andReturn(SocialiteUser::fake([
                'id' => 'facebook-user-123',
                'name' => 'Facebook User',
                'email' => 'facebook-user@example.org',
                'avatar' => 'https://example.org/facebook-avatar.jpg',
                'verified' => true,
            ]));

        Socialite::shouldReceive('driver')
            ->once()
            ->with('facebook')
            ->andReturn($provider);

        $response = $this->get('/api/v1/auth/facebook/callback');

        $response->assertRedirect();
        $location = $response->headers->get('Location');
        $this->assertStringStartsWith('http://localhost:5173/en/oauth/callback?code=', $location);
        $this->assertStringNotContainsString('token=', $location);
        $this->assertDatabaseHas('users', [
            'email' => 'facebook-user@example.org',
            'registered_via' => 'facebook',
            'status' => User::STATUS_ACTIVE,
        ]);
        $this->assertDatabaseHas('user_auth_providers', [
            'provider' => 'facebook',
            'provider_user_id' => 'facebook-user-123',
            'provider_email' => 'facebook-user@example.org',
        ]);
        $this->assertDatabaseCount('oauth_login_codes', 1);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_oauth_code_can_be_exchanged_once_for_expiring_access_token(): void
    {
        $user = User::create([
            'name' => 'OAuth User',
            'email' => 'oauth-user@example.org',
            'preferred_locale' => 'en',
            'status' => User::STATUS_ACTIVE,
            'registered_via' => 'facebook',
            'email_verified_at' => now(),
        ]);

        $code = app(\App\Services\OAuthLoginCodeService::class)->create(
            $user,
            'facebook',
            request(),
        );

        $response = $this->postJson('/api/v1/auth/oauth/exchange', [
            'code' => $code,
            'device_name' => 'Web Client',
        ])->assertOk()
            ->assertJsonPath('token.token_type', 'Bearer')
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonStructure(['token' => ['access_token', 'expires_at']]);

        $this->assertNotEmpty($response->json('token.access_token'));
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertNotNull(OAuthLoginCode::first()->consumed_at);

        $this->postJson('/api/v1/auth/oauth/exchange', [
            'code' => $code,
            'device_name' => 'Web Client',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('code');
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
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
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
