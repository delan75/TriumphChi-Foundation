<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
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

        app(PermissionRegistrar::class)->forgetCachedPermissions();
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

