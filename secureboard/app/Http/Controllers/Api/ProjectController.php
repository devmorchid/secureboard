<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Project::class);

        $perPage = $request->query('per_page', 20);
        $q = Project::query();
        if ($search = $request->query('search')) {
            $q->where('title', 'like', "%{$search}%");
        }

        $p = $q->with(['owner', 'team'])->paginate($perPage);
        logger()->debug('Projects loaded for index', [
            'projects' => $p->items()
        ]);
        return response()->json([
            'data' => ProjectResource::collection($p->items()),
            'meta' => [
                'current_page' => $p->currentPage(),
                'per_page' => $p->perPage(),
                'total' => $p->total(),
                'last_page' => $p->lastPage(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Project::class);
logger()->info('Creating project', ['request' => $request->all()]);
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:draft,active,archived',
            'owner_id' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'team' => 'nullable|array',
            'team.*' => 'exists:users,id',
        ]);

        $project = Project::create($data + ['owner_id' => $data['owner_id'] ?? $request->user()->id]);
        logger()->info('Project created', ['project' => $project->toArray()]);
        if (!empty($data['team'])) {
            $project->team()->sync($data['team']);
        }

        return response()->json(new ProjectResource($project->load(['owner', 'team'])), 201);
    }

    public function show(Project $project)
    {
        $this->authorize('view', $project);
        return response()->json(new ProjectResource($project->load('owner')));
    }

    public function update(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:draft,active,archived',
            'owner_id' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $project->update($data);

        return response()->json(new ProjectResource($project->fresh()->load('owner')));
    }

    public function destroy(Project $project)
    {
        $this->authorize('delete', $project);
        $project->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
