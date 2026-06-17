<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canManageBeneficiaries($user);
    }

    public function view(User $user, Application $application): bool
    {
        return $this->canManageBeneficiaries($user);
    }

    public function create(User $user): bool
    {
        return $this->canManageBeneficiaries($user);
    }

    public function update(User $user, Application $application): bool
    {
        return $this->canManageBeneficiaries($user);
    }

    public function transition(User $user, Application $application): bool
    {
        return $this->canManageBeneficiaries($user);
    }

    public function delete(User $user, Application $application): bool
    {
        return $this->hasRole($user, ['administrator', 'super_administrator']);
    }

    private function canManageBeneficiaries(User $user): bool
    {
        return $this->hasRole($user, ['field_officer', 'ngo_staff', 'administrator', 'super_administrator']);
    }

    private function hasRole(User $user, array $roles): bool
    {
        return $user->roles()->whereIn('name', $roles)->exists();
    }
}

