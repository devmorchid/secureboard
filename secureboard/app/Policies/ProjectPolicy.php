<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function before(User $user, $ability)
    {
        if (method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return true;
        }
    }

    public function viewAny(User $user)
    {
        return true; // authenticated users can list projects
    }

    public function view(User $user, Project $project)
    {
        return $project->owner_id === $user->id || (method_exists($user, 'hasRole') && $user->hasRole('manager')) || (method_exists($user, 'hasRole') && $user->hasRole('admin'));
    }

    public function create(User $user)
    {
        return method_exists($user, 'hasRole') ? ($user->hasRole('manager') || $user->hasRole('admin')) : false;
    }

    public function update(User $user, Project $project)
    {
        return $project->owner_id === $user->id || (method_exists($user, 'hasRole') && $user->hasRole('manager'));
    }

    public function delete(User $user, Project $project)
    {
        return method_exists($user, 'hasRole') ? ($user->hasRole('manager') || $user->hasRole('admin')) : false;
    }
}
