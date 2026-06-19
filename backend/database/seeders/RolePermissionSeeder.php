<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use RuntimeException;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    private const GUARD = 'web';

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = collect($this->permissionGroups())
            ->flatMap(fn (array $permissions, string $group) => collect($permissions)->map(fn (string $name) => [
                'name' => $name,
                'group' => $group,
            ]))
            ->mapWithKeys(fn (array $permission) => [
                $permission['name'] => Permission::firstOrCreate(
                    ['name' => $permission['name'], 'guard_name' => self::GUARD],
                    ['group' => $permission['group']],
                ),
            ]);

        $roles = [
            'donor' => ['impact_updates.view'],
            'beneficiary' => [],
            'volunteer' => ['beneficiaries.view', 'impact_updates.create'],
            'school_coordinator' => ['applications.view', 'applications.create', 'beneficiaries.view', 'schools.view', 'impact_updates.create'],
            'field_officer' => ['applications.view', 'applications.create', 'applications.update', 'applications.verify', 'beneficiaries.view', 'beneficiaries.update', 'schools.view', 'impact_updates.create'],
            'ngo_staff' => [
                'applications.view',
                'applications.create',
                'applications.update',
                'applications.verify',
                'beneficiaries.view',
                'beneficiaries.create',
                'beneficiaries.update',
                'schools.view',
                'schools.create',
                'schools.update',
                'donors.view',
                'donations.view',
                'funds.view',
                'allocations.view',
                'payments.view',
                'impact_updates.view',
                'impact_updates.create',
                'reports.view',
            ],
            'administrator' => $permissions->keys()->reject(fn (string $name) => $name === 'permissions.manage')->all(),
            'super_administrator' => $permissions->keys()->all(),
        ];

        foreach ($roles as $name => $rolePermissions) {
            $role = Role::firstOrCreate(
                ['name' => $name, 'guard_name' => self::GUARD],
                ['label' => str($name)->replace('_', ' ')->title()],
            );

            $role->syncPermissions($permissions->only($rolePermissions)->values());
        }

        $this->seedSuperAdministrator($permissions);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    private function seedSuperAdministrator(Collection $permissions): void
    {
        $password = env('SUPER_ADMIN_PASSWORD');

        if (! $password && app()->environment(['local', 'testing'])) {
            $password = 'password';
        }

        if (! $password) {
            throw new RuntimeException('SUPER_ADMIN_PASSWORD must be set before seeding the super administrator.');
        }

        $admin = User::firstOrCreate(
            ['email' => env('SUPER_ADMIN_EMAIL', 'admin@triumphchi.org')],
            [
                'name' => env('SUPER_ADMIN_NAME', 'Super Administrator'),
                'password' => $password,
                'preferred_locale' => env('SUPER_ADMIN_LOCALE', 'en'),
            ],
        );

        $admin->syncRoles(['super_administrator']);
        $admin->syncPermissions($permissions->values());
        $admin->authProviders()->firstOrCreate(
            ['provider' => 'local'],
            ['linked_at' => now()],
        );
    }

    private function permissionGroups(): array
    {
        return [
            'applications' => [
                'applications.view',
                'applications.create',
                'applications.update',
                'applications.delete',
                'applications.verify',
            ],
            'beneficiaries' => [
                'beneficiaries.view',
                'beneficiaries.create',
                'beneficiaries.update',
                'beneficiaries.delete',
            ],
            'schools' => [
                'schools.view',
                'schools.create',
                'schools.update',
                'schools.delete',
            ],
            'donors' => [
                'donors.view',
                'donors.create',
                'donors.update',
                'donors.delete',
            ],
            'donations' => [
                'donations.view',
                'donations.create',
                'donations.update',
                'donations.approve',
            ],
            'funds' => [
                'funds.view',
                'funds.create',
                'funds.update',
            ],
            'allocations' => [
                'allocations.view',
                'allocations.create',
                'allocations.update',
            ],
            'payments' => [
                'payments.view',
                'payments.create',
                'payments.approve',
            ],
            'impact_updates' => [
                'impact_updates.view',
                'impact_updates.create',
                'impact_updates.publish',
            ],
            'reports' => [
                'reports.view',
            ],
            'users' => [
                'users.view',
                'users.create',
                'users.update',
                'users.delete',
            ],
            'settings' => [
                'roles.manage',
                'permissions.manage',
                'audit_logs.view',
            ],
        ];
    }
}
