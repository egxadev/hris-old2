<?php

namespace App\Http\Controllers\Admin;

use App\Models\Branch;
use App\Models\Region;
use Illuminate\Http\Request;
use App\Services\Admin\BranchService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BranchRequest;

class BranchController extends Controller
{
    protected $branchService;

    public function __construct(BranchService $branchService)
    {
        $this->branchService = $branchService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $breadcrumbs = [
            [
                'title' => 'Branch',
                'href' => route('admin.branches.index')
            ]
        ];

        $data = $this->branchService->getPaginatedBranches($request->all());

        return inertia('admin/branches/index', array_merge(
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
                'title' => 'Branch',
                'href' => route('admin.branches.index')
            ],
            [
                'title' => 'Create',
                'href' => route('admin.branches.create')
            ]
        ];

        return inertia('admin/branches/create', [
            'breadcrumbs' => $breadcrumbs,
            'regions' => Region::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BranchRequest $request)
    {
        $response = $this->branchService->createBranch($request->validated());

        if ($response['success']) {
            return redirect()->route('admin.branches.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.branches.index')->with('error', $response['message']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $breadcrumbs = [
            [
                'title' => 'Branch',
                'href' => route('admin.branches.index')
            ],
            [
                'title' => 'Edit',
                'href' => route('admin.branches.edit', $id)
            ]
        ];

        $branch = $this->branchService->getBranchById($id);

        return inertia('admin/branches/edit', [
            'breadcrumbs' => $breadcrumbs,
            'regions'     => Region::all(),
            'branch'      => $branch['data'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(BranchRequest $request, Branch $branch)
    {
        $response = $this->branchService->updateBranch($branch, $request->validated());

        if ($response['success']) {
            return redirect()->route('admin.branches.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.branches.index')->with('error', $response['message']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $response = $this->branchService->deleteBranch($id);

        if ($response['success']) {
            return redirect()->route('admin.branches.index')->with('success', $response['message']);
        } else {
            return redirect()->route('admin.branches.index')->with('error', $response['message']);
        }
    }
}
