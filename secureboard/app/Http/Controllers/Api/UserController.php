<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $perPage = $request->query('per_page', 25);
        $users = User::query();
        if ($search = $request->query('search')) {
            $users->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
        }

        $p = $users->paginate($perPage);
        return response()->json(["data" => UserResource::collection($p->items()), "meta" => [
            'current_page' => $p->currentPage(),
            'per_page' => $p->perPage(),
            'total' => $p->total(),
            'last_page' => $p->lastPage(),
        ]]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string',
        ]);

        $data['password'] = bcrypt($data['password']);
        $user = User::create($data);

        // assign role if laratrust available
        if (isset($data['role']) && method_exists($user, 'assignRole')) {
            $user->assignRole($data['role']);
        }

        return response()->json(new UserResource($user), 201);
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);
        return response()->json(new UserResource($user));
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'password' => 'sometimes|nullable|string|min:6',
            'role' => 'sometimes|string',
        ]);

        if (! empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        if (isset($data['role']) && method_exists($user, 'syncRoles')) {
            $user->syncRoles([$data['role']]);
        }

        return response()->json(new UserResource($user));
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);
        $user->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
