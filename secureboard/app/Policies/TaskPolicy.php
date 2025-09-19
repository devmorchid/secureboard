<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function before(User $user, $ability)
    {
        if (method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return true;
        }
    }

    public function viewAny(User $user)
    {
        return true; // authenticated users can list tasks (filtered by controller)
    }

    public function view(User $user, Task $task)
    {
        return $task->assigned_to === $user->id || $task->created_by === $user->id || (method_exists($user, 'hasRole') && $user->hasRole('manager'));
    }

    public function create(User $user)
    {
        return method_exists($user, 'hasRole') ? ($user->hasRole('manager') || $user->hasRole('admin') || $user->hasRole('user')) : true;
    }

    public function update(User $user, Task $task)
    {
        // assigned user can change status; managers/admins can change everything
        if ($task->assigned_to === $user->id) {
            return true;
        }

        return method_exists($user, 'hasRole') ? ($user->hasRole('manager') || $user->hasRole('admin')) : false;
    }

    public function delete(User $user, Task $task)
    {
        return method_exists($user, 'hasRole') ? ($user->hasRole('manager') || $user->hasRole('admin')) : false;
    }
}
