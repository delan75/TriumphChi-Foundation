# Permission System

The backend uses Spatie Laravel Permission for RBAC and Laravel Policies for resource-level authorization.

## Architecture

- Roles are bundles of permissions.
- API routes and policies authorize permissions, not role names.
- Policies remain responsible for record-specific rules, such as future region assignment checks.
- Sanctum-authenticated API requests use the `web` guard for Spatie permissions.

## Permission Convention

Permissions use `{resource}.{action}`.

Examples:

- `applications.view`
- `applications.create`
- `applications.update`
- `applications.delete`
- `applications.verify`
- `beneficiaries.view`
- `beneficiaries.create`
- `beneficiaries.update`
- `beneficiaries.delete`
- `donations.approve`
- `payments.approve`
- `impact_updates.publish`
- `roles.manage`
- `permissions.manage`
- `audit_logs.view`

## Policy Pattern

Permissions answer:

```php
$user->can('beneficiaries.update');
```

Policies answer:

```php
public function update(User $user, Beneficiary $beneficiary): bool
{
    return $user->can('beneficiaries.update')
        && $user->region_id === $beneficiary->region_id;
}
```

The region check becomes active once region ownership tables are added.

## Admin UI Direction

React remains the primary product frontend.

Filament may be introduced later only for internal operational administration such as:

- Users
- Roles
- Permissions
- Audit logs
- Settings
- CMS content

Core workflows such as applications, beneficiaries, sponsorships, allocations, payments, reports, and portals should remain in React.

