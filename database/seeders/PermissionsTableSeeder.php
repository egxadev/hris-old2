<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Helper function to create permission only if it doesn't exist
        $createPermission = function($name) {
            if (!Permission::where('name', $name)->where('guard_name', 'web')->exists()) {
                Permission::create(['name' => $name, 'guard_name' => 'web']);
            }
        };

        //permission dashboard
        $createPermission('dashboard.index');
        $createPermission('dashboard.statistics');
        $createPermission('dashboard.chart');

        //permission roles
        $createPermission('roles.index');
        $createPermission('roles.create');
        $createPermission('roles.edit');
        $createPermission('roles.delete');

        //permission permissions
        $createPermission('permissions.index');

        //permission users
        $createPermission('users.index');
        $createPermission('users.create');
        $createPermission('users.edit');
        $createPermission('users.delete');

        // ADMIN PERMISSIONS
        //permission regions
        $createPermission('admin.regions.index');
        $createPermission('admin.regions.create');
        $createPermission('admin.regions.edit');
        $createPermission('admin.regions.delete');

        //permission branches
        $createPermission('admin.branches.index');
        $createPermission('admin.branches.create');
        $createPermission('admin.branches.edit');
        $createPermission('admin.branches.delete');

        //permission departments
        $createPermission('admin.departments.index');
        $createPermission('admin.departments.create');
        $createPermission('admin.departments.edit');
        $createPermission('admin.departments.delete');

        //permission positions
        $createPermission('admin.positions.index');
        $createPermission('admin.positions.create');
        $createPermission('admin.positions.edit');
        $createPermission('admin.positions.delete');

        //permission employees
        $createPermission('admin.employees.index');
        $createPermission('admin.employees.create');
        $createPermission('admin.employees.edit');
        $createPermission('admin.employees.delete');

        //permission shifts
        $createPermission('admin.shifts.index');
        $createPermission('admin.shifts.create');
        $createPermission('admin.shifts.edit');
        $createPermission('admin.shifts.delete');

        //permission schedules
        $createPermission('admin.schedules.index');
        $createPermission('admin.schedules.create');
        $createPermission('admin.schedules.edit');
        $createPermission('admin.schedules.delete');

        //permission attendances
        $createPermission('admin.attendances.index');
        $createPermission('admin.attendances.create');
        $createPermission('admin.attendances.edit');
        $createPermission('admin.attendances.delete');

        //permission reports
        $createPermission('admin.reports.attendance');
        $createPermission('admin.reports.attendance.export');

        // USER PERMISSIONS
        //permission checkin attendance
        $createPermission('user.attendances.checkin');

        //permission checkout attendance
        $createPermission('user.attendances.checkout');

        //permission history attendance
        $createPermission('user.attendances.history');
    }
}
