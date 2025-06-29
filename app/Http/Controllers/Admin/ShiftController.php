<?php

namespace App\Http\Controllers\Admin;

use App\Models\Shift;
use Illuminate\Http\Request;
use App\Services\Admin\ShiftService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ShiftRequest;

class ShiftController extends Controller
{
    protected $shiftService;

    public function __construct(ShiftService $shiftService)
    {
        $this->shiftService = $shiftService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $breadcrumbs = [
            [
                'title' => 'Shift',
                'href' => route('admin.shifts.index')
            ]
        ];

        $data = $this->shiftService->getPaginatedShifts($request->all());

        return inertia('admin/shifts/index', array_merge(
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
                'title' => 'Shift',
                'href' => route('admin.shifts.index')
            ],
            [
                'title' => 'Create',
                'href' => route('admin.shifts.create')
            ]
        ];

        return inertia('admin/shifts/create', [
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ShiftRequest $request)
    {
        $response = $this->shiftService->createShift($request->validated());

        if ($response['success']) {
            return redirect()->route('admin.shifts.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.shifts.index')->with('error', $response['message']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $breadcrumbs = [
            [
                'title' => 'Shift',
                'href' => route('admin.shifts.index')
            ],
            [
                'title' => 'Edit',
                'href' => route('admin.shifts.edit', $id)
            ]
        ];

        $shift = $this->shiftService->getShiftById($id);

        return inertia('admin/shifts/edit', [
            'breadcrumbs' => $breadcrumbs,
            'shift'      => $shift['data'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ShiftRequest $request, Shift $shift)
    {
        $response = $this->shiftService->updateShift($shift, $request->validated());

        if ($response['success']) {
            return redirect()->route('admin.shifts.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.shifts.index')->with('error', $response['message']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $response = $this->shiftService->deleteShift($id);

        if ($response['success']) {
            return redirect()->route('admin.shifts.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.shifts.index')->with('error', $response['message']);
        }
    }
}
