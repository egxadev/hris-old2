<?php

namespace App\Services;

use App\Models\Branch;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class BranchService
{
    private const DEFAULT_PER_PAGE = 10;
    private const DEFAULT_SORT_BY = 'name';
    private const DEFAULT_SORT_DIR = 'asc';
    private const FILTERABLE_COLUMNS = ['region_id', 'name', 'code', 'address', 'created_at'];

    /**
     * Get paginated branches with filters.
     *
     * @param array $filters
     * @return array
     */
    public function getPaginatedBranches(array $filters): array
    {
        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $page = (int) ($filters['page'] ?? 1);
        $sortBy  = in_array($sort = $filters['sort_by'] ?? self::DEFAULT_SORT_BY, self::FILTERABLE_COLUMNS) ? $sort : self::DEFAULT_SORT_BY;
        $sortDir = in_array($dir = strtolower($filters['sort_dir'] ?? self::DEFAULT_SORT_DIR), ['asc', 'desc']) ? $dir : self::DEFAULT_SORT_DIR;

        $search = trim($filters['search'] ?? '');

        $query = Branch::query();

        $query->when($search, function ($query) use ($search) {
            $query->where(function ($subQuery) use ($search) {
                foreach (self::FILTERABLE_COLUMNS as $column) {
                    $subQuery->orWhere($column, 'like', "%{$search}%");
                }
            });
        });

        $query->orderBy($sortBy, $sortDir);

        $data = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data'  => $data->items(),
            'meta'  => [
                'current_page'  => $data->currentPage(),
                'last_page'     => $data->lastPage(),
                'per_page'      => $data->perPage(),
                'total'         => $data->total(),
                'from'          => $data->firstItem(),
                'to'            => $data->lastItem(),
            ],
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ]
        ];
    }

    /**
     * Create new branch.
     *
     * @param array $data
     * @return array
     */
    public function createBranch(array $data): array
    {
        try {
            $branch = \DB::transaction(function () use ($data) {
                $branch = Branch::create([
                    'region_id'     => $data['region_id'],
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'address'       => $data['address'],
                    'created_by'    => auth()->id(),
                ]);

                return $branch;
            });

            return [
                'success'   => true,
                'message'   => 'Branch created successfully.',
                'branch'    => $branch,
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to create branch: ' . $e->getMessage());
            return [
                'success'   => false,
                'message'   => 'Failed to create branch.',
            ];
        }
    }

    /**
     * Update branch data.
     *
     * @param Branch $branch
     * @param array $data
     * @return array
     */
    public function updateBranch(Branch $branch, array $data): array
    {
        try {
            \DB::transaction(function () use ($branch, $data) {
                $branch->update([
                    'region_id'     => $data['region_id'],
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'address'       => $data['address'],
                    'updated_by'    => auth()->id(),
                ]);
            });

            return [
                'success'   => true,
                'message'   => 'Branch updated successfully.',
                'data'      => $branch->fresh(),
            ];
        } catch (ModelNotFoundException $e) {
            return [
                'success'   => false,
                'message'   => 'Branch not found.',
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to update branch: ' . $e->getMessage());
            return [
                'success'   => false,
                'message'   => 'Failed to update branch.',
            ];
        }
    }

    /**
     * Delete branch by ID.
     *
     * @param string $id
     * @return array
     */
    public function deleteBranch(string $id): array
    {
        try {
            $branch = Branch::findOrFail($id);

            return \DB::transaction(function () use ($branch) {
                $branch->update(['deleted_by' => auth()->id()]);
                $branch->delete();

                return [
                    'success'   => true,
                    'message'   => 'Branch deleted successfully.'
                ];
            });
        } catch (ModelNotFoundException $e) {
            return [
                'success'   => false,
                'message'   => 'Branch not found.'
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to delete branch: ' . $e->getMessage());
            return [
                'success'   => false,
                'message'   => 'Failed to delete branch.'
            ];
        }
    }
}
