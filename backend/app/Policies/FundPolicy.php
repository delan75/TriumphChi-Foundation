<?php

namespace App\Policies;

use App\Models\Fund;
use App\Models\User;

class FundPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('funds.view');
    }

    public function view(User $user, Fund $fund): bool
    {
        return $user->can('funds.view');
    }

    public function create(User $user): bool
    {
        return $user->can('funds.create');
    }

    public function update(User $user, Fund $fund): bool
    {
        return $user->can('funds.update');
    }

    public function delete(User $user, Fund $fund): bool
    {
        return $user->can('funds.update');
    }
}
