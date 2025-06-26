<?php

namespace App\Http\Controllers\Admin;

use App\Models\Department;
use Illuminate\Http\Request;
use App\Services\DepartmentService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DepartmentRequest;

class DepartmentController extends Controller
{
    protected $departmentService;

    public function __construct(DepartmentService $departmentService)
    {
        $this->departmentService = $departmentService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $breadcrumbs = [
            [
                'title' => 'Department',
                'href' => route('departments.index')
            ]
        ];

        $data = $this->departmentService->getPaginatedDepartments($request->all());

        return inertia('departments/index', array_merge(
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
                'title' => 'Department',
                'href' => route('departments.index')
            ],
            [
                'title' => 'Create',
                'href' => route('departments.create')
            ]
        ];

        return inertia('departments/create', [
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DepartmentRequest $request)
    {
        $response = $this->departmentService->createDepartment($request->validated());

        if ($response['success']) {
            return redirect()->route('departments.index')->with('success', $response['message']);
        } else {
            return redirect()->route('departments.index')->with('error', $response['message']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $breadcrumbs = [
            [
                'title' => 'Department',
                'href' => route('departments.index')
            ],
            [
                'title' => 'Edit',
                'href' => route('departments.edit', $id)
            ]
        ];

        $department = $this->departmentService->getDepartmentById($id);

        return inertia('departments/edit', [
            'breadcrumbs' => $breadcrumbs,
            'department'  => $department['data'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DepartmentRequest $request, Department $department)
    {
        $response = $this->departmentService->updateDepartment($department, $request->validated());

        if ($response['success']) {
            return redirect()->route('departments.index')->with('success', $response['message']);
        } else {
            return redirect()->route('departments.index')->with('error', $response['message']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $response = $this->departmentService->deleteDepartment($id);

        if ($response['success']) {
            return redirect()->route('departments.index')->with('success', $response['message']);
        } else {
            return redirect()->route('departments.index')->with('error', $response['message']);
        }
    }
}
