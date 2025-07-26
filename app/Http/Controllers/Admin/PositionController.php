<?php

namespace App\Http\Controllers\Admin;

use App\Models\Position;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Services\Admin\PositionService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PositionRequest;

class PositionController extends Controller
{
    protected $positionService;

    public function __construct(PositionService $positionService)
    {
        $this->positionService = $positionService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $breadcrumbs = [
            [
                'title' => 'Position',
                'href' => route('admin.positions.index')
            ]
        ];

        $data = $this->positionService->getPaginatedPositions($request->all());

        return inertia('admin/positions/index', array_merge(
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
                'title' => 'Position',
                'href' => route('admin.positions.index')
            ],
            [
                'title' => 'Create',
                'href' => route('admin.positions.create')
            ]
        ];

        return inertia('admin/positions/create', [
            'breadcrumbs' => $breadcrumbs,
            'departments' => Department::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PositionRequest $request)
    {
        $response = $this->positionService->createPosition($request->validated());

        if ($response['success']) {
            return redirect()->route('admin.positions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.positions.index')->with('error', $response['message']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $breadcrumbs = [
            [
                'title' => 'Position',
                'href' => route('admin.positions.index')
            ],
            [
                'title' => 'Edit',
                'href' => route('admin.positions.edit', $id)
            ]
        ];

        $position = $this->positionService->getPositionById($id);

        return inertia('admin/positions/edit', [
            'breadcrumbs' => $breadcrumbs,
            'departments' => Department::all(),
            'position'    => $position['data'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PositionRequest $request, Position $position)
    {
        $response = $this->positionService->updatePosition($position, $request->validated());

        if ($response['success']) {
            return redirect()->route('admin.positions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.positions.index')->with('error', $response['message']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $response = $this->positionService->deletePosition($id);

        if ($response['success']) {
            return redirect()->route('admin.positions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.positions.index')->with('error', $response['message']);
        }
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $response = $this->positionService->restorePosition($id);

        if ($response['success']) {
            return redirect()->route('admin.positions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.positions.index')->with('error', $response['message']);
        }
    }

    /**
     * Force delete the specified resource from storage.
     */
    public function forceDelete(string $id)
    {
        $response = $this->positionService->forceDeletePosition($id);

        if ($response['success']) {
            return redirect()->route('admin.positions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.positions.index')->with('error', $response['message']);
        }
    }
}
