<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = collect([
            'applications.view',
            'applications.manage',
            'beneficiaries.view_private',
            'beneficiaries.manage',
            'schools.manage',
            'donations.manage',
            'funds.manage',
            'allocations.manage',
            'payments.manage',
            'reports.view',
            'settings.manage',
        ])->mapWithKeys(fn (string $name) => [
            $name => Permission::firstOrCreate(['name' => $name], ['label' => str($name)->replace('.', ' ')->title()]),
        ]);

        $roles = [
            'donor' => ['reports.view'],
            'beneficiary' => [],
            'volunteer' => ['applications.view'],
            'school_coordinator' => ['applications.view', 'beneficiaries.view_private'],
            'field_officer' => ['applications.manage', 'beneficiaries.manage'],
            'ngo_staff' => ['applications.manage', 'beneficiaries.manage', 'schools.manage', 'donations.manage', 'funds.manage', 'allocations.manage', 'payments.manage', 'reports.view'],
            'administrator' => $permissions->keys()->reject(fn ($name) => $name === 'settings.manage')->all(),
            'super_administrator' => $permissions->keys()->all(),
        ];

        foreach ($roles as $name => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $name], ['label' => str($name)->replace('_', ' ')->title()]);
            $role->permissions()->sync($permissions->only($rolePermissions)->pluck('id'));
        }
    }
}

