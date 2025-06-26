<?php

namespace App\Services;

use App\Models\Department;
use App\Traits\ResponseFormatter;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DepartmentService
{
    use ResponseFormatter;

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
     * Create a new department.
     *
     * @param array $data
     * @return array
     */
    public function createDepartment(array $data): array
    {
        try {
            $createdData = \DB::transaction(function () use ($data) {
                $department = Department::create([
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'created_by'    => auth()->id()
                ]);

                return $department;
            });

            return $this->successResponse($createdData, 'Department created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create department: ' . $e->getMessage());
            return $this->errorResponse('Failed to create department.');
        }
    }

    /**
     * Update department.
     *
     * @param Department $department
     * @param array $data
     * @return Department
     */
    public function updateDepartment(Department $department, array $data): array
    {
        try {
            $updatedData = \DB::transaction(function () use ($department, $data) {
                $department->update([
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'updated_by'    => auth()->id()
                ]);
                return $department;
            });

            return $this->successResponse($updatedData, 'Department updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Department not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to update department: ' . $e->getMessage());
            return $this->errorResponse('Failed to update department.');
        }
    }

    /**
     * Get department by ID.
     *
     * @param string $id
     * @return array
     */
    public function getDepartmentById(string $id): array
    {
        $department = Department::findOrFail($id);
        return $this->successResponse($department, 'Department retrieved successfully.');
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

            \DB::transaction(function () use ($department) {
                $department->update(['deleted_by' => auth()->id()]);
                $department->delete();
            });

            return $this->successResponse(null, 'Department deleted successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Department not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete department: ' . $e->getMessage());
            return $this->errorResponse('Failed to delete department.');
        }
    }
}
