<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        // If Laratrust is installed and User has roles, try to include primary role name.
        $role = null;
        if (method_exists($this, 'getRoleNames')) {
            $names = $this->getRoleNames();
            $role = $names->first() ?? null;
        } elseif (isset($this->roles) && $this->roles->first()) {
            $role = $this->roles->first()->name;
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $role,
            'avatar' => $this->avatar ?? null,
            'created_at' => optional($this->created_at)->toDateTimeString(),
        ];
    }
}
