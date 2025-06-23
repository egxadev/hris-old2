<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\RegionController;
use App\Http\Controllers\Admin\PositionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\PermissionController;

Route::get('/', function () {
    return inertia('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // permissions
    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index')
        ->middleware('permission:permissions.index');

    // roles
    Route::resource('/roles', RoleController::class)
        ->middleware('permission:roles.index|roles.create|roles.edit|roles.delete');

    // users
    Route::resource('/users', UserController::class)
        ->middleware('permission:users.index|users.create|users.edit|users.delete');

    // regions
    Route::resource('/regions', RegionController::class)
        ->middleware('permission:regions.index|regions.create|regions.edit|regions.delete');

    // branches
    Route::resource('/branches', BranchController::class)
        ->middleware('permission:branches.index|branches.create|branches.edit|branches.delete');

    // departments
    Route::resource('/departments', DepartmentController::class)
        ->middleware('permission:departments.index|departments.create|departments.edit|departments.delete');

    // positions
    Route::resource('/positions', PositionController::class)
        ->middleware('permission:positions.index|positions.create|positions.edit|positions.delete');
});

Route::get('/api/regions/{region}/branches', function (string $region) {
    return \App\Models\Branch::where('region_id', $region)->get();
});

Route::get('/api/branches/{branch}/departments', function (string $branch) {
    return \App\Models\Department::where('branch_id', $branch)->get();
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
