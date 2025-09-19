<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Task::class);

        $perPage = $request->query('per_page', 20);
        $q = Task::query()->with(['project', 'assignee', 'creator']);

        if ($project = $request->query('project_id')) {
            $q->where('project_id', $project);
        }
        if ($assigned = $request->query('assigned_to')) {
            $q->where('assigned_to', $assigned);
        }
        if ($status = $request->query('status')) {
            $q->where('status', $status);
        }

        $p = $q->paginate($perPage);
        return response()->json(['data' => TaskResource::collection($p->items()), 'meta' => [
            'current_page' => $p->currentPage(),
            'per_page' => $p->perPage(),
            'total' => $p->total(),
            'last_page' => $p->lastPage(),
        ]]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Task::class);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:todo,in_progress,done',
            'priority' => 'nullable|in:low,medium,high',
            'project_id' => 'required|exists:projects,id',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $data['created_by'] = $request->user()->id;
        $task = Task::create($data);

        return response()->json(new TaskResource($task->load(['project','assignee','creator'])), 201);
    }

    public function show(Task $task)
    {
        $this->authorize('view', $task);
        return response()->json(new TaskResource($task->load(['project','assignee','creator'])));
    }

    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:todo,in_progress,done',
            'priority' => 'nullable|in:low,medium,high',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $task->update($data);
        return response()->json(new TaskResource($task->fresh()->load(['project','assignee','creator'])));
    }

    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);
        $task->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
