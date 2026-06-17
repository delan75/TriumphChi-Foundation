<?php

namespace App\Policies;

use App\Models\Sponsorship;
use App\Models\User;

class SponsorshipPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('donors.view');
    }

    public function view(User $user, Sponsorship $sponsorship): bool
    {
        return $user->can('donors.view');
    }

    public function create(User $user): bool
    {
        return $user->can('donors.update');
    }

    public function update(User $user, Sponsorship $sponsorship): bool
    {
        return $user->can('donors.update');
    }

    public function delete(User $user, Sponsorship $sponsorship): bool
    {
        return $user->can('donors.delete');
    }
}
