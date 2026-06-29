<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class UserManagementApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_users_index_requires_users_view_permission(): void
    {
        Sanctum::actingAs($this->activeUser());

        $this->getJson('/api/v1/users')->assertForbidden();
    }

    public function test_user_with_view_permission_can_search_users(): void
    {
        $viewer = $this->activeUser(['users.view']);
        $caseOfficer = $this->activeUser(name: 'Alice Case Officer', email: 'alice.case@example.org');
        $caseOfficer->profile()->create([
            'department' => 'Case Management',
            'position' => 'Field Officer',
            'employment_type' => 'full_time',
        ]);

        Sanctum::actingAs($viewer);

        $this->getJson('/api/v1/users?search=Alice&department=Case%20Management')
            ->assertOk()
            ->assertJsonPath('data.0.email', 'alice.case@example.org')
            ->assertJsonPath('data.0.profile.department', 'Case Management')
            ->assertJsonPath('summary.total_count', 1);
    }

    public function test_authorized_user_can_create_managed_user_with_profile_and_access(): void
    {
        $admin = $this->activeUser(['users.view', 'users.create']);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/users', [
            'name' => 'Grace Manager',
            'email' => 'grace.manager@example.org',
            'phone' => '+237677000001',
            'employee_number' => 'TCF-0009',
            'preferred_locale' => 'fr',
            'roles' => ['ngo_staff'],
            'direct_permissions' => ['reports.view'],
            'profile' => [
                'department' => 'Programs',
                'position' => 'Program Officer',
                'employment_type' => 'full_time',
                'office_location' => 'Douala',
                'skills' => ['case review', 'community follow-up'],
                'languages' => ['English', 'French'],
            ],
        ])->assertCreated()
            ->assertJsonPath('message', 'User account created successfully.')
            ->assertJsonPath('data.email', 'grace.manager@example.org')
            ->assertJsonPath('data.status', User::STATUS_INVITED)
            ->assertJsonPath('data.profile.department', 'Programs')
            ->assertJsonPath('data.roles.0.name', 'ngo_staff');

        $user = User::firstWhere('email', 'grace.manager@example.org');

        $this->assertNotNull($user->uuid);
        $this->assertTrue($user->hasRole('ngo_staff'));
        $this->assertTrue($user->hasDirectPermission('reports.view'));
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'auditable_type' => User::class,
            'auditable_id' => $user->id,
            'action' => 'managed_user_created',
        ]);
    }

    public function test_access_management_requires_permission_and_blocks_self_changes(): void
    {
        $admin = $this->activeUser(['users.view', 'users.access.manage']);
        $target = $this->activeUser(email: 'target@example.org');

        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/users/{$target->uuid}/access", [
            'roles' => ['field_officer'],
            'direct_permissions' => ['reports.view'],
        ])->assertOk()
            ->assertJsonPath('message', 'User access updated successfully.')
            ->assertJsonPath('data.roles.0.name', 'field_officer');

        $this->assertTrue($target->fresh()->hasRole('field_officer'));
        $this->assertTrue($target->fresh()->hasDirectPermission('reports.view'));

        $this->patchJson("/api/v1/users/{$admin->uuid}/access", [
            'roles' => ['super_administrator'],
            'direct_permissions' => [],
        ])->assertStatus(422);
    }

    public function test_status_actions_and_session_termination_are_permission_guarded(): void
    {
        $admin = $this->activeUser(['users.view', 'users.suspend', 'users.activate', 'users.sessions.manage']);
        $target = $this->activeUser(email: 'session-user@example.org');
        $target->createToken('device-one');

        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/users/{$target->uuid}/suspend", [
            'note' => 'Access paused during review.',
        ])->assertOk()
            ->assertJsonPath('data.status', User::STATUS_SUSPENDED);

        $this->assertDatabaseCount('personal_access_tokens', 0);

        $target->createToken('device-two');

        $this->postJson("/api/v1/users/{$target->uuid}/activate")
            ->assertOk()
            ->assertJsonPath('data.status', User::STATUS_ACTIVE);

        $this->postJson("/api/v1/users/{$target->uuid}/terminate-sessions")
            ->assertOk()
            ->assertJsonPath('message', 'User sessions terminated successfully.');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_access_options_are_grouped_for_user_management_ui(): void
    {
        $viewer = $this->activeUser(['users.view']);

        Sanctum::actingAs($viewer);

        $this->getJson('/api/v1/users/access-options')
            ->assertOk()
            ->assertJsonPath('data.roles.0.name', 'administrator')
            ->assertJsonFragment(['name' => 'users.access.manage'])
            ->assertJsonFragment(['value' => User::STATUS_ACTIVE]);
    }

    private function activeUser(array $permissions = [], ?string $name = null, ?string $email = null): User
    {
        $user = User::create([
            'name' => $name ?? 'Staff User',
            'email' => $email ?? fake()->unique()->safeEmail(),
            'password' => 'password',
            'preferred_locale' => 'en',
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);

        if ($permissions !== []) {
            foreach ($permissions as $permission) {
                Permission::firstOrCreate(
                    ['name' => $permission, 'guard_name' => 'web'],
                    ['group' => str($permission)->before('.')->toString()],
                );
            }

            $role = Role::firstOrCreate(['name' => 'test_role_'.$user->id, 'guard_name' => 'web']);
            $role->syncPermissions($permissions);
            $user->assignRole($role);
        }

        return $user;
    }
}
