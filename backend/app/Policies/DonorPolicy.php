<?php

namespace App\Policies;

use App\Models\Donor;
use App\Models\User;

class DonorPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('donors.view');
    }

    public function view(User $user, Donor $donor): bool
    {
        return $user->can('donors.view');
    }

    public function create(User $user): bool
    {
        return $user->can('donors.create');
    }

    public function update(User $user, Donor $donor): bool
    {
        return $user->can('donors.update');
    }

    public function delete(User $user, Donor $donor): bool
    {
        return $user->can('donors.delete');
    }
}
