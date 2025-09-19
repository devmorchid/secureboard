<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'owner' => new UserResource($this->whenLoaded('owner')),
            'team' => UserResource::collection($this->whenLoaded('team')),
            'start_date' => $this->start_date instanceof \Carbon\Carbon ? $this->start_date->toDateString() : ($this->start_date ?? null),
            'end_date' => $this->end_date instanceof \Carbon\Carbon ? $this->end_date->toDateString() : ($this->end_date ?? null),
            'created_at' => optional($this->created_at)->toDateTimeString(),
        ];
    }
}
