<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function before(User $user, $ability)
    {
        // super admin shortcut if needed
        if (method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return true;
        }
     
    }

    public function viewAny(User $user)
    {
        return method_exists($user, 'hasRole') ? $user->hasRole('admin') : ($user->email === 'admin@local');
    }

    public function view(User $user, User $model)
    {
        return $user->id === $model->id || (method_exists($user, 'hasRole') && $user->hasRole('admin'));
    }

    public function create(User $user)
    {
        return method_exists($user, 'hasRole') ? $user->hasRole('admin') : ($user->email === 'admin@local');
    }

    public function update(User $user, User $model)
    {
        return $user->id === $model->id || (method_exists($user, 'hasRole') && $user->hasRole('admin'));
    }

    public function delete(User $user, User $model)
    {
        return method_exists($user, 'hasRole') ? $user->hasRole('admin') : ($user->email === 'admin@local');
    }
}
