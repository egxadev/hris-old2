<?php

namespace App\Http\Controllers\Admin;

use App\Models\Attendance;
use Illuminate\Http\Request;
use App\Services\Admin\AttendanceService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AttendanceRequest;

class AttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $breadcrumbs = [
            [
                'title' => 'Attendance',
                'href' => route('admin.attendances.index')
            ]
        ];

        $data = $this->attendanceService->getPaginatedAttendances($request->all());

        return inertia('admin/attendances/index', array_merge(
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
                'title' => 'Attendance',
                'href' => route('admin.attendances.index')
            ],
            [
                'title' => 'Create',
                'href' => route('admin.attendances.create')
            ]
        ];


        $employees = $this->attendanceService->getEmployeesForDropdown();

        return inertia('admin/attendances/create', [
            'breadcrumbs' => $breadcrumbs,
            'employees' => $employees['data'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AttendanceRequest $request)
    {
        $response = $this->attendanceService->createAttendance($request->validated());

        if ($response['success']) {
            return redirect()->route('admin.attendances.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.attendances.index')->with('error', $response['message']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $breadcrumbs = [
            [
                'title' => 'Attendance',
                'href' => route('admin.attendances.index')
            ],
            [
                'title' => 'Edit',
                'href' => route('admin.attendances.edit', $id)
            ]
        ];

        $employees = $this->attendanceService->getEmployeesForDropdown();
        $attendance = $this->attendanceService->getAttendanceById($id);

        return inertia('admin/attendances/edit', [
            'breadcrumbs' => $breadcrumbs,
            'attendance'  => $attendance['data'],
            'employees' => $employees['data'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AttendanceRequest $request, Attendance $attendance)
    {
        $response = $this->attendanceService->updateAttendance($attendance, $request->validated());

        if ($response['success']) {
            return redirect()->route('admin.attendances.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.attendances.index')->with('error', $response['message']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $response = $this->attendanceService->deleteAttendance($id);

        if ($response['success']) {
            return redirect()->route('admin.attendances.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.attendances.index')->with('error', $response['message']);
        }
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $response = $this->attendanceService->restoreAttendance($id);

        if ($response['success']) {
            return redirect()->route('admin.attendances.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.attendances.index')->with('error', $response['message']);
        }
    }

    /**
     * Force delete the specified resource from storage.
     */
    public function forceDelete(string $id)
    {
        $response = $this->attendanceService->forceDeleteAttendance($id);

        if ($response['success']) {
            return redirect()->route('admin.attendances.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.attendances.index')->with('error', $response['message']);
        }
    }
}
