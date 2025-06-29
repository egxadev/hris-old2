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
        //permission dashboard
        Permission::create(['name' => 'dashboard.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'dashboard.statistics', 'guard_name' => 'web']);
        Permission::create(['name' => 'dashboard.chart', 'guard_name' => 'web']);

        //permission roles
        Permission::create(['name' => 'roles.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'roles.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'roles.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'roles.delete', 'guard_name' => 'web']);

        //permission permissions
        Permission::create(['name' => 'permissions.index', 'guard_name' => 'web']);

        //permission users
        Permission::create(['name' => 'users.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'users.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'users.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'users.delete', 'guard_name' => 'web']);






        // ADMIN PERMISSIONS

        //permission regions
        Permission::create(['name' => 'admin.regions.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.regions.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.regions.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.regions.delete', 'guard_name' => 'web']);

        //permission branches
        Permission::create(['name' => 'admin.branches.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.branches.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.branches.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.branches.delete', 'guard_name' => 'web']);

        //permission departments
        Permission::create(['name' => 'admin.departments.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.departments.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.departments.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.departments.delete', 'guard_name' => 'web']);

        //permission positions
        Permission::create(['name' => 'admin.positions.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.positions.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.positions.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.positions.delete', 'guard_name' => 'web']);

        //permission employees
        Permission::create(['name' => 'admin.employees.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.employees.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.employees.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.employees.delete', 'guard_name' => 'web']);

        //permission shifts
        Permission::create(['name' => 'admin.shifts.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.shifts.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.shifts.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.shifts.delete', 'guard_name' => 'web']);

        //permission schedules
        Permission::create(['name' => 'admin.schedules.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.schedules.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.schedules.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.schedules.delete', 'guard_name' => 'web']);

        //permission attendances
        Permission::create(['name' => 'admin.attendances.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.attendances.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.attendances.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'admin.attendances.delete', 'guard_name' => 'web']);

        // USER PERMISSIONS
        //permission checkin attendance
        Permission::create(['name' => 'user.attendances.checkin', 'guard_name' => 'web']);

        //permission checkout attendance
        Permission::create(['name' => 'user.attendances.checkout', 'guard_name' => 'web']);

        //permission history attendance
        Permission::create(['name' => 'user.attendances.history', 'guard_name' => 'web']);
    }
}
