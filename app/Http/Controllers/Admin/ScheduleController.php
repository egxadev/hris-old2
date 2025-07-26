<?php

namespace App\Http\Controllers\Admin;

use App\Models\Schedule;
use Illuminate\Http\Request;
use App\Services\Admin\ScheduleService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ScheduleRequest;

class ScheduleController extends Controller
{
    protected $scheduleService;

    public function __construct(ScheduleService $scheduleService)
    {
        $this->scheduleService = $scheduleService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $breadcrumbs = [
            [
                'title' => 'Schedule',
                'href' => route('admin.schedules.index')
            ]
        ];

        $data = $this->scheduleService->getPaginatedSchedules($request->all());

        return inertia('admin/schedules/index', array_merge(
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
                'title' => 'Schedule',
                'href' => route('admin.schedules.index')
            ],
            [
                'title' => 'Create',
                'href' => route('admin.schedules.create')
            ]
        ];

        $employees = $this->scheduleService->getEmployeesForDropdown();
        $shifts = $this->scheduleService->getShiftsForDropdown();

        return inertia('admin/schedules/create', [
            'breadcrumbs' => $breadcrumbs,
            'employees' => $employees['data'],
            'shifts' => $shifts['data'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ScheduleRequest $request)
    {
        $response = $this->scheduleService->createSchedule($request->validated());

        if ($response['success']) {
            return redirect()->route('admin.schedules.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.schedules.index')->with('error', $response['message']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $breadcrumbs = [
            [
                'title' => 'Schedule',
                'href' => route('admin.schedules.index')
            ],
            [
                'title' => 'Edit',
                'href' => route('admin.schedules.edit', $id)
            ]
        ];

        $schedule = $this->scheduleService->getScheduleById($id);
        $employees = $this->scheduleService->getEmployeesForDropdown();
        $shifts = $this->scheduleService->getShiftsForDropdown();

        return inertia('admin/schedules/edit', [
            'breadcrumbs' => $breadcrumbs,
            'schedule' => $schedule['data'],
            'employees' => $employees['data'],
            'shifts' => $shifts['data'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ScheduleRequest $request, Schedule $schedule)
    {
        $response = $this->scheduleService->updateSchedule($schedule, $request->validated());

        if ($response['success']) {
            return redirect()->route('admin.schedules.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.schedules.index')->with('error', $response['message']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $response = $this->scheduleService->deleteSchedule($id);

        if ($response['success']) {
            return redirect()->route('admin.schedules.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.schedules.index')->with('error', $response['message']);
        }
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $response = $this->scheduleService->restoreSchedule($id);

        if ($response['success']) {
            return redirect()->route('admin.schedules.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.schedules.index')->with('error', $response['message']);
        }
    }

    /**
     * Force delete the specified resource from storage.
     */
    public function forceDelete(string $id)
    {
        $response = $this->scheduleService->forceDeleteSchedule($id);

        if ($response['success']) {
            return redirect()->route('admin.schedules.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.schedules.index')->with('error', $response['message']);
        }
    }
}
