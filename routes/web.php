<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\Admin\ShiftController;
use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\RegionController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\PositionController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\User\AttendanceController as UserAttendanceController;

Route::get('/', function () {
    return redirect()->route('login');
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


    // Employee Management routes with admin prefix
    Route::prefix('admin')->name('admin.')->group(function () {
        // regions
        Route::resource('/regions', RegionController::class)
            ->middleware('permission:admin.regions.index|admin.regions.create|admin.regions.edit|admin.regions.delete');

        Route::patch('/regions/{id}/restore', [RegionController::class, 'restore'])
            ->name('regions.restore')
            ->middleware('permission:admin.regions.delete');

        Route::delete('/regions/{id}/force-delete', [RegionController::class, 'forceDelete'])
            ->name('regions.force-delete')
            ->middleware('permission:admin.regions.delete');

        // branches
        Route::resource('/branches', BranchController::class)
            ->middleware('permission:admin.branches.index|admin.branches.create|admin.branches.edit|admin.branches.delete');

        Route::patch('/branches/{id}/restore', [BranchController::class, 'restore'])
            ->name('branches.restore')
            ->middleware('permission:admin.branches.delete');

        Route::delete('/branches/{id}/force-delete', [BranchController::class, 'forceDelete'])
            ->name('branches.force-delete')
            ->middleware('permission:admin.branches.delete');

        // departments
        Route::resource('/departments', DepartmentController::class)
            ->middleware('permission:admin.departments.index|admin.departments.create|admin.departments.edit|admin.departments.delete');

        Route::patch('/departments/{id}/restore', [DepartmentController::class, 'restore'])
            ->name('departments.restore')
            ->middleware('permission:admin.departments.delete');

        Route::delete('/departments/{id}/force-delete', [DepartmentController::class, 'forceDelete'])
            ->name('departments.force-delete')
            ->middleware('permission:admin.departments.delete');

        // positions
        Route::resource('/positions', PositionController::class)
            ->middleware('permission:admin.positions.index|admin.positions.create|admin.positions.edit|admin.positions.delete');

        Route::patch('/positions/{id}/restore', [PositionController::class, 'restore'])
            ->name('positions.restore')
            ->middleware('permission:admin.positions.delete');

        Route::delete('/positions/{id}/force-delete', [PositionController::class, 'forceDelete'])
            ->name('positions.force-delete')
            ->middleware('permission:admin.positions.delete');

        // employees
        Route::resource('/employees', EmployeeController::class)
            ->middleware('permission:admin.employees.index|admin.employees.create|admin.employees.edit|admin.employees.delete');

        Route::patch('/employees/{id}/restore', [EmployeeController::class, 'restore'])
            ->name('employees.restore')
            ->middleware('permission:admin.employees.delete');

        Route::delete('/employees/{id}/force-delete', [EmployeeController::class, 'forceDelete'])
            ->name('employees.force-delete')
            ->middleware('permission:admin.employees.delete');

        // Attendance routes
        // shifts
        Route::resource('/shifts', ShiftController::class)
            ->middleware('permission:admin.shifts.index|admin.shifts.create|admin.shifts.edit|admin.shifts.delete');

        Route::patch('/shifts/{id}/restore', [ShiftController::class, 'restore'])
            ->name('shifts.restore')
            ->middleware('permission:admin.shifts.delete');

        Route::delete('/shifts/{id}/force-delete', [ShiftController::class, 'forceDelete'])
            ->name('shifts.force-delete')
            ->middleware('permission:admin.shifts.delete');

        // schedules
        Route::resource('/schedules', ScheduleController::class)
            ->middleware('permission:admin.schedules.index|admin.schedules.create|admin.schedules.edit|admin.schedules.delete');

        Route::patch('/schedules/{id}/restore', [ScheduleController::class, 'restore'])
            ->name('schedules.restore')
            ->middleware('permission:admin.schedules.delete');

        Route::delete('/schedules/{id}/force-delete', [ScheduleController::class, 'forceDelete'])
            ->name('schedules.force-delete')
            ->middleware('permission:admin.schedules.delete');

        // attendance
        Route::resource('/attendances', AttendanceController::class)
            ->middleware('permission:admin.attendances.index|admin.attendances.create|admin.attendances.edit|admin.attendances.delete');

        Route::patch('/attendances/{id}/restore', [AttendanceController::class, 'restore'])
            ->name('attendances.restore')
            ->middleware('permission:admin.attendances.delete');

        Route::delete('/attendances/{id}/force-delete', [AttendanceController::class, 'forceDelete'])
            ->name('attendances.force-delete')
            ->middleware('permission:admin.attendances.delete');

        // reports
        Route::get('/reports/attendance', [ReportController::class, 'attendanceIndex'])
            ->middleware('permission:admin.reports.attendance')
            ->name('reports.attendance');

        Route::post('/reports/attendance/data', [ReportController::class, 'attendanceReport'])
            ->middleware('permission:admin.reports.attendance')
            ->name('reports.attendance.data');

        Route::post('/reports/attendance/export-pdf', [ReportController::class, 'exportAttendancePdf'])
            ->middleware('permission:admin.reports.attendance|admin.reports.attendance.export')
            ->name('reports.attendance.export-pdf');
    });

    // Employee routes with user prefix
    Route::prefix('user')->name('user.')->group(function () {
        Route::get('/attendances/checkin', [UserAttendanceController::class, 'checkin'])
            ->name('attendances.checkin')
            ->middleware('permission:user.attendances.checkin');

        Route::post('/attendances/checkin', [UserAttendanceController::class, 'storeCheckin'])
            ->name('attendances.store.checkin')
            ->middleware('permission:user.attendances.checkin');

        Route::get('/attendances/checkout', [UserAttendanceController::class, 'checkout'])
            ->name('attendances.checkout')
            ->middleware('permission:user.attendances.checkout');

        Route::post('/attendances/checkout', [UserAttendanceController::class, 'storeCheckout'])
            ->name('attendances.store.checkout')
            ->middleware('permission:user.attendances.checkout');

        Route::get('/attendances/history', [UserAttendanceController::class, 'history'])
            ->name('attendances.history')
            ->middleware('permission:user.attendances.history');
    });
});

Route::get('/api/admin/regions/{region}/branches', function (string $region) {
    return \App\Models\Branch::where('region_id', $region)->get();
});

Route::get('/api/admin/branches/{branch}/departments', function (string $branch) {
    return \App\Models\Department::where('branch_id', $branch)->get();
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
