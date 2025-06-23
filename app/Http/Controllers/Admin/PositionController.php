<?php

namespace App\Http\Controllers\Admin;

use App\Models\Position;
use App\Models\Department;
use App\Models\Region;
use App\Models\Branch;
use Illuminate\Http\Request;
use App\Services\PositionService;
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
                'href' => route('positions.index')
            ]
        ];

        $data = $this->positionService->getPaginatedPositions($request->all());

        return inertia('positions/index', array_merge(
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
                'href' => route('positions.index')
            ],
            [
                'title' => 'Create',
                'href' => route('positions.create')
            ]
        ];

        return inertia('positions/create', [
            'breadcrumbs' => $breadcrumbs,
            'regions' => Region::all(),
            'branches' => [],
            'departments' => [],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PositionRequest $request)
    {
        $response = $this->positionService->createPosition($request->all());

        if ($response['success']) {
            return redirect()->route('positions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('positions.index')->with('error', $response['message']);
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
                'href' => route('positions.index')
            ],
            [
                'title' => 'Edit',
                'href' => route('positions.edit', $id)
            ]
        ];

        $position = Position::with('department.branch.region')->findOrFail($id);
        
        return inertia('positions/edit', [
            'breadcrumbs' => $breadcrumbs,
            'regions' => Region::all(),
            'position' => $position,
            'branches' => $position->department ? Branch::where('region_id', $position->department->branch->region_id)->get() : [],
            'departments' => $position->department ? Department::where('branch_id', $position->department->branch_id)->get() : [],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PositionRequest $request, Position $position)
    {
        $response = $this->positionService->updatePosition($position, $request->all());

        if ($response['success']) {
            return redirect()->route('positions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('positions.index')->with('error', $response['message']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $response = $this->positionService->deletePosition($id);

        if ($response['success']) {
            return redirect()->route('positions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('positions.index')->with('error', $response['message']);
        }
    }
}
