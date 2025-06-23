<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Branch;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DepartmentService
{
    private const DEFAULT_PER_PAGE = 10;
    private const DEFAULT_SORT_BY = 'name';
    private const DEFAULT_SORT_DIR = 'asc';
    private const FILTERABLE_COLUMNS = ['name', 'code', 'created_at'];

    /**
     * Get paginated departments with filters.
     *
     * @param array $filters
     * @return array
     */
    public function getPaginatedDepartments(array $filters): array
    {
        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $page = (int) ($filters['page'] ?? 1);
        $sortBy  = in_array($sort = $filters['sort_by'] ?? self::DEFAULT_SORT_BY, self::FILTERABLE_COLUMNS) ? $sort : self::DEFAULT_SORT_BY;
        $sortDir = in_array($dir = strtolower($filters['sort_dir'] ?? self::DEFAULT_SORT_DIR), ['asc', 'desc']) ? $dir : self::DEFAULT_SORT_DIR;

        $search = trim($filters['search'] ?? '');

        $query = Department::query();

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
     * Get department by ID with branch relationship.
     *
     * @param string $id
     * @return array
     */
    public function getDepartmentById(string $id): array
    {
        try {
            $department = Department::with('branch.region')->findOrFail($id);
            
            return [
                'department' => $department,
                'branches' => Branch::all(),
            ];
        } catch (ModelNotFoundException $e) {
            return [
                'success' => false,
                'message' => 'Department not found.',
                'redirect' => 'departments.index',
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to retrieve department: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to retrieve department.',
                'redirect' => 'departments.index',
            ];
        }
    }

    /**
     * Create new department.
     *
     * @param array $data
     * @return array
     */
    public function createDepartment(array $data): array
    {
        try {
            $department = \DB::transaction(function () use ($data) {
                $department = Department::create([
                    'branch_id'     => $data['branch_id'],
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'created_by'    => auth()->id(),
                ]);

                return $department;
            });

            return [
                'success'   => true,
                'message'   => 'Department created successfully.',
                'department'    => $department,
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to create department: ' . $e->getMessage());
            return [
                'success'   => false,
                'message'   => 'Failed to create department.',
            ];
        }
    }

    /**
     * Update department data.
     *
     * @param Department $department
     * @param array $data
     * @return array
     */
    public function updateDepartment(Department $department, array $data): array
    {
        try {
            \DB::transaction(function () use ($department, $data) {
                $department->update([
                    'branch_id'     => $data['branch_id'],
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'updated_by'    => auth()->id(),
                ]);
            });

            return [
                'success'   => true,
                'message'   => 'Department updated successfully.',
                'data'      => $department->fresh(),
            ];
        } catch (ModelNotFoundException $e) {
            return [
                'success'   => false,
                'message'   => 'Department not found.',
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to update department: ' . $e->getMessage());
            return [
                'success'   => false,
                'message'   => 'Failed to update department.',
            ];
        }
    }

    /**
     * Delete department by ID.
     *
     * @param string $id
     * @return array
     */
    public function deleteDepartment(string $id): array
    {
        try {
            $department = Department::findOrFail($id);

            return \DB::transaction(function () use ($department) {
                $department->update(['deleted_by' => auth()->id()]);
                $department->delete();

                return [
                    'success'   => true,
                    'message'   => 'Department deleted successfully.'
                ];
            });
        } catch (ModelNotFoundException $e) {
            return [
                'success'   => false,
                'message'   => 'Department not found.'
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to delete department: ' . $e->getMessage());
            return [
                'success'   => false,
                'message'   => 'Failed to delete department.'
            ];
        }
    }
}
