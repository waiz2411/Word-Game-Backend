<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TelemetryController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\LevelController;

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

// User endpoints
Route::post('/user/sync', [UserController::class, 'sync']);

// Telemetry logging endpoints
Route::post('/telemetry/event', [TelemetryController::class, 'logEvent']);

// Level generation endpoint
Route::get('/level/{number}', [LevelController::class, 'generate']);

// Admin dashboard query endpoints
Route::get('/admin/stats', [AdminController::class, 'stats']);
Route::get('/admin/events', [AdminController::class, 'events']);
Route::get('/admin/users', [AdminController::class, 'users']);
Route::get('/admin/rates', [AdminController::class, 'getRates']);
Route::post('/admin/rates', [AdminController::class, 'saveRates']);
