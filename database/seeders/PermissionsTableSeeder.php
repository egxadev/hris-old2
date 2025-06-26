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

        //permission regions
        Permission::create(['name' => 'regions.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'regions.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'regions.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'regions.delete', 'guard_name' => 'web']);

        //permission branches
        Permission::create(['name' => 'branches.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'branches.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'branches.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'branches.delete', 'guard_name' => 'web']);

        //permission departments
        Permission::create(['name' => 'departments.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'departments.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'departments.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'departments.delete', 'guard_name' => 'web']);

        //permission positions
        Permission::create(['name' => 'positions.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'positions.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'positions.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'positions.delete', 'guard_name' => 'web']);

        //permission employees
        Permission::create(['name' => 'employees.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'employees.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'employees.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'employees.delete', 'guard_name' => 'web']);

        //permission shifts
        Permission::create(['name' => 'shifts.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'shifts.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'shifts.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'shifts.delete', 'guard_name' => 'web']);

        //permission schedules
        Permission::create(['name' => 'schedules.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'schedules.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'schedules.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'schedules.delete', 'guard_name' => 'web']);

        //permission attendances
        Permission::create(['name' => 'attendances.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'attendances.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'attendances.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'attendances.delete', 'guard_name' => 'web']);
        Permission::create(['name' => 'attendances.print', 'guard_name' => 'web']);
        Permission::create(['name' => 'attendances.request', 'guard_name' => 'web']);

        //permission leaves
        Permission::create(['name' => 'leaves.index', 'guard_name' => 'web']);
        Permission::create(['name' => 'leaves.create', 'guard_name' => 'web']);
        Permission::create(['name' => 'leaves.edit', 'guard_name' => 'web']);
        Permission::create(['name' => 'leaves.delete', 'guard_name' => 'web']);
        Permission::create(['name' => 'leaves.approve', 'guard_name' => 'web']);
        Permission::create(['name' => 'leaves.reject', 'guard_name' => 'web']);
        Permission::create(['name' => 'leaves.print', 'guard_name' => 'web']);
        Permission::create(['name' => 'leaves.request', 'guard_name' => 'web']);
    }
}
