<?php

namespace App\Http\Controllers\Admin;

use App\Models\Branch;
use App\Models\Region;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Services\Admin\EmployeeService;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EmployeeRequest;

class EmployeeController extends Controller
{
    protected $employeeService;

    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $breadcrumbs = [
            [
                'title' => 'Employee',
                'href' => route('admin.employees.index')
            ]
        ];

        $data = $this->employeeService->getPaginatedEmployees($request->all());

        return inertia('admin/employees/index', array_merge(
            ['breadcrumbs' => $breadcrumbs],
            $data
        ));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $breadcrumbs = [
            [
                'title' => 'Employee',
                'href' => route('admin.employees.index')
            ],
            [
                'title' => 'Create',
                'href' => route('admin.employees.create')
            ]
        ];

        $regions = Region::all();
        $branches = Branch::all();
        $departments = Department::all();
        $positions = Position::all();
        $roles = Role::all();

        return inertia('admin/employees/create', [
            'breadcrumbs' => $breadcrumbs,
            'regions' => $regions,
            'branches' => $branches,
            'departments' => $departments,
            'positions' => $positions,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(EmployeeRequest $request)
    {
        $response = $this->employeeService->createEmployeeWithUser($request->validated());

        if ($response['success']) {
            return redirect()->route('admin.employees.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.employees.index')->with('error', $response['message']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $breadcrumbs = [
            [
                'title' => 'Employee',
                'href' => route('admin.employees.index')
            ],
            [
                'title' => 'Edit',
                'href' => route('admin.employees.edit', $id)
            ]
        ];

        $employee = $this->employeeService->getEmployeeWithUserById($id);
        $regions = Region::all();
        $branches = Branch::all();
        $departments = Department::all();
        $positions = Position::all();
        $roles = Role::all();

        return inertia('admin/employees/edit', [
            'breadcrumbs' => $breadcrumbs,
            'employee'    => $employee['data'],
            'regions' => $regions,
            'branches' => $branches,
            'departments' => $departments,
            'positions' => $positions,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(EmployeeRequest $request, Employee $employee)
    {
        $response = $this->employeeService->updateEmployeeWithUser($employee, $request->validated());

        if ($response['success']) {
            return redirect()->route('admin.employees.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.employees.index')->with('error', $response['message']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $response = $this->employeeService->deleteEmployee($id);

        if ($response['success']) {
            return redirect()->route('admin.employees.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.employees.index')->with('error', $response['message']);
        }
    }
}
