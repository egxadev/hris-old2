<?php

namespace App\Services;

use App\Models\Branch;
use App\Traits\ResponseFormatter;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class BranchService
{
    use ResponseFormatter;

    private const DEFAULT_PER_PAGE = 10;
    private const DEFAULT_SORT_BY = 'name';
    private const DEFAULT_SORT_DIR = 'asc';
    private const FILTERABLE_COLUMNS = ['name', 'code', 'created_at'];

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

        return $this->paginatedResponse($data->items(), [
            'current_page'  => $data->currentPage(),
            'last_page'     => $data->lastPage(),
            'per_page'      => $data->perPage(),
            'total'         => $data->total(),
            'from'          => $data->firstItem(),
            'to'            => $data->lastItem(),
        ], [
            'search'        => $search,
            'sort_by'       => $sortBy,
            'sort_dir'      => $sortDir,
        ]);
    }

    /**
     * Get branch by ID.
     *
     * @param string $id
     * @return array
     */
    public function getBranchById(string $id): array
    {
        $branch = Branch::with('region')->findOrFail($id);
        return $this->successResponse($branch, 'Branch retrieved successfully.');
    }

    /**
     * Create a new branch.
     *
     * @param array $data
     * @return array
     */
    public function createBranch(array $data): array
    {
        try {
            $createdData = \DB::transaction(function () use ($data) {
                $branch = Branch::create([
                    'region_id'     => $data['region_id'],
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'address'       => $data['address'],
                    'created_by'    => auth()->id()
                ]);

                return $branch;
            });

            return $this->successResponse($createdData, 'Branch created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create branch: ' . $e->getMessage());
            return $this->errorResponse('Failed to create branch.');
        }
    }

    /**
     * Update branch.
     *
     * @param Branch $branch
     * @param array $data
     * @return Branch
     */
    public function updateBranch(Branch $branch, array $data): array
    {
        try {
            $updatedData = \DB::transaction(function () use ($branch, $data) {
                $branch->update([
                    'region_id'     => $data['region_id'],
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'address'       => $data['address'],
                    'updated_by'    => auth()->id()
                ]);
                return $branch;
            });

            return $this->successResponse($updatedData, 'Branch updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Branch not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to update branch: ' . $e->getMessage());
            return $this->errorResponse('Failed to update branch.');
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

            \DB::transaction(function () use ($branch) {
                $branch->update(['deleted_by' => auth()->id()]);
                $branch->delete();
            });

            return $this->successResponse(null, 'Branch deleted successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Branch not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete branch: ' . $e->getMessage());
            return $this->errorResponse('Failed to delete branch.');
        }
    }
}
