<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // Users (admin-only endpoints will be authorized in controller/policies)
    Route::apiResource('users', App\Http\Controllers\Api\UserController::class);

    // Projects & Tasks
    Route::apiResource('projects', App\Http\Controllers\Api\ProjectController::class);
    Route::apiResource('tasks', App\Http\Controllers\Api\TaskController::class);
});
