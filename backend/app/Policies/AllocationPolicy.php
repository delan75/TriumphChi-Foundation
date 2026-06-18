<?php

namespace App\Policies;

use App\Models\Allocation;
use App\Models\User;

class AllocationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('allocations.view');
    }

    public function view(User $user, Allocation $allocation): bool
    {
        return $user->can('allocations.view');
    }

    public function create(User $user): bool
    {
        return $user->can('allocations.create');
    }

    public function update(User $user, Allocation $allocation): bool
    {
        return $user->can('allocations.update');
    }

    public function delete(User $user, Allocation $allocation): bool
    {
        return $user->can('allocations.update');
    }
}
