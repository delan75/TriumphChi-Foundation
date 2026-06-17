<?php

namespace App\Policies;

use App\Models\Donation;
use App\Models\User;

class DonationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('donations.view');
    }

    public function view(User $user, Donation $donation): bool
    {
        return $user->can('donations.view');
    }

    public function create(User $user): bool
    {
        return $user->can('donations.create');
    }

    public function update(User $user, Donation $donation): bool
    {
        return $user->can('donations.update');
    }

    public function delete(User $user, Donation $donation): bool
    {
        return $user->can('donations.approve');
    }
}
