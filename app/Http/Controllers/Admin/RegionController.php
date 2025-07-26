<?php

namespace App\Http\Controllers\Admin;

use App\Models\Region;
use Illuminate\Http\Request;
use App\Services\Admin\RegionService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RegionRequest;

class RegionController extends Controller
{
    protected $regionService;

    public function __construct(RegionService $regionService)
    {
        $this->regionService = $regionService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $breadcrumbs = [
            [
                'title' => 'Region',
                'href' => route('admin.regions.index')
            ]
        ];

        $data = $this->regionService->getPaginatedRegions($request->all());

        return inertia('admin/regions/index', array_merge(
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
                'title' => 'Region',
                'href' => route('admin.regions.index')
            ],
            [
                'title' => 'Create',
                'href' => route('admin.regions.create')
            ]
        ];

        return inertia('admin/regions/create', [
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RegionRequest $request)
    {
        $response = $this->regionService->createRegion($request->validated());

        if ($response['success']) {
            return redirect()->route('admin.regions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.regions.index')->with('error', $response['message']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $breadcrumbs = [
            [
                'title' => 'Region',
                'href' => route('admin.regions.index')
            ],
            [
                'title' => 'Edit',
                'href' => route('admin.regions.edit', $id)
            ]
        ];

        $region = $this->regionService->getRegionById($id);

        return inertia('admin/regions/edit', [
            'breadcrumbs' => $breadcrumbs,
            'region'      => $region['data'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RegionRequest $request, Region $region)
    {
        $response = $this->regionService->updateRegion($region, $request->validated());

        if ($response['success']) {
            return redirect()->route('admin.regions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.regions.index')->with('error', $response['message']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $response = $this->regionService->deleteRegion($id);

        if ($response['success']) {
            return redirect()->route('admin.regions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.regions.index')->with('error', $response['message']);
        }
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $response = $this->regionService->restoreRegion($id);

        if ($response['success']) {
            return redirect()->route('admin.regions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.regions.index')->with('error', $response['message']);
        }
    }

    /**
     * Force delete the specified resource from storage.
     */
    public function forceDelete(string $id)
    {
        $response = $this->regionService->forceDeleteRegion($id);

        if ($response['success']) {
            return redirect()->route('admin.regions.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.regions.index')->with('error', $response['message']);
        }
    }
}
