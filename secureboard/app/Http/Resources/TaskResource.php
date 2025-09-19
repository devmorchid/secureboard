<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'project' => new ProjectResource($this->whenLoaded('project')),
            'assigned_to' => new UserResource($this->whenLoaded('assignee')),
            'due_date' => optional($this->due_date)->toDateString(),
            'created_by' => new UserResource($this->whenLoaded('creator')),
            'created_at' => optional($this->created_at)->toDateTimeString(),
        ];
    }
}
