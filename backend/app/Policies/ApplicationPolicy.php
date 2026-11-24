<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('applications.view');
    }

    public function view(User $user, Application $application): bool
    {
        return $user->can('applications.view');
    }

    public function create(User $user): bool
    {
        return $user->can('applications.create');
    }

    public function update(User $user, Application $application): bool
    {
        return $user->can('applications.update');
    }

    public function transition(User $user, Application $application): bool
    {
        return $user->can('applications.verify');
    }

    public function addNote(User $user, Application $application): bool
    {
        return $user->can('applications.verify') || $user->can('applications.update');
    }

    public function delete(User $user, Application $application): bool
    {
        return $user->can('applications.delete');
    }
}

