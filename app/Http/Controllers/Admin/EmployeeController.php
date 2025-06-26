<?php

namespace App\Http\Controllers\Admin;

use App\Models\Employee;
use Illuminate\Http\Request;
use App\Services\EmployeeService;
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
                'href' => route('employees.index')
            ]
        ];

        $data = $this->employeeService->getPaginatedEmployees($request->all());

        return inertia('employees/index', array_merge(
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
                'href' => route('employees.index')
            ],
            [
                'title' => 'Create',
                'href' => route('employees.create')
            ]
        ];

        return inertia('employees/create', [
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(EmployeeRequest $request)
    {
        $response = $this->employeeService->createEmployee($request->validated());

        if ($response['success']) {
            return redirect()->route('employees.index')->with('success', $response['message']);
        } else {
            return redirect()->route('employees.index')->with('error', $response['message']);
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
                'href' => route('employees.index')
            ],
            [
                'title' => 'Edit',
                'href' => route('employees.edit', $id)
            ]
        ];

        $employee = $this->employeeService->getEmployeeById($id);

        return inertia('employees/edit', [
            'breadcrumbs' => $breadcrumbs,
            'employee'    => $employee['data'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(EmployeeRequest $request, Employee $employee)
    {
        $response = $this->employeeService->updateEmployee($employee, $request->validated());

        if ($response['success']) {
            return redirect()->route('employees.index')->with('success', $response['message']);
        } else {
            return redirect()->route('employees.index')->with('error', $response['message']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $response = $this->employeeService->deleteEmployee($id);

        if ($response['success']) {
            return redirect()->route('employees.index')->with('success', $response['message']);
        } else {
            return redirect()->route('employees.index')->with('error', $response['message']);
        }
    }
}
