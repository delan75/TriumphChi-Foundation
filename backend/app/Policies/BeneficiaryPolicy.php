<?php

namespace App\Policies;

use App\Models\Beneficiary;
use App\Models\User;

class BeneficiaryPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canAccessPrivateChildData($user);
    }

    public function view(User $user, Beneficiary $beneficiary): bool
    {
        return $this->canAccessPrivateChildData($user);
    }

    public function create(User $user): bool
    {
        return $this->canAccessPrivateChildData($user);
    }

    public function update(User $user, Beneficiary $beneficiary): bool
    {
        return $this->canAccessPrivateChildData($user);
    }

    public function delete(User $user, Beneficiary $beneficiary): bool
    {
        return $user->roles()->whereIn('name', ['administrator', 'super_administrator'])->exists();
    }

    private function canAccessPrivateChildData(User $user): bool
    {
        return $user->roles()
            ->whereIn('name', ['school_coordinator', 'field_officer', 'ngo_staff', 'administrator', 'super_administrator'])
            ->exists();
    }
}

