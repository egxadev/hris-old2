<?php

namespace App\Services\Admin;

use App\Models\Position;
use App\Traits\ResponseFormatter;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PositionService
{
    use ResponseFormatter;

    private const DEFAULT_PER_PAGE = 10;
    private const DEFAULT_SORT_BY = 'name';
    private const DEFAULT_SORT_DIR = 'asc';
    private const FILTERABLE_COLUMNS = ['name', 'code', 'created_at'];

    /**
     * Get paginated positions with filters.
     *
     * @param array $filters
     * @return array
     */
    public function getPaginatedPositions(array $filters): array
    {
        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $page = (int) ($filters['page'] ?? 1);
        $sortBy  = in_array($sort = $filters['sort_by'] ?? self::DEFAULT_SORT_BY, self::FILTERABLE_COLUMNS) ? $sort : self::DEFAULT_SORT_BY;
        $sortDir = in_array($dir = strtolower($filters['sort_dir'] ?? self::DEFAULT_SORT_DIR), ['asc', 'desc']) ? $dir : self::DEFAULT_SORT_DIR;

        $search = trim($filters['search'] ?? '');
        $trashed = filter_var($filters['trashed'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $query = $trashed ? Position::onlyTrashed() : Position::query();

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
            'trashed'       => $trashed,
        ]);
    }

    /**
     * Get position by ID.
     *
     * @param string $id
     * @return array
     */
    public function getPositionById(string $id): array
    {
        $position = Position::with('department')->findOrFail($id);
        return $this->successResponse($position, 'Position retrieved successfully.');
    }

    /**
     * Create a new position.
     *
     * @param array $data
     * @return array
     */
    public function createPosition(array $data): array
    {
        try {
            $createdData = \DB::transaction(function () use ($data) {
                $position = Position::create([
                    'department_id' => $data['department_id'],
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'created_by'    => auth()->id()
                ]);

                return $position;
            });

            return $this->successResponse($createdData, 'Position created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create position: ' . $e->getMessage());
            return $this->errorResponse('Failed to create position.');
        }
    }

    /**
     * Update position.
     *
     * @param Position $position
     * @param array $data
     * @return Position
     */
    public function updatePosition(Position $position, array $data): array
    {
        try {
            $updatedData = \DB::transaction(function () use ($position, $data) {
                $position->update([
                    'department_id' => $data['department_id'],
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'updated_by'    => auth()->id()
                ]);
                return $position;
            });

            return $this->successResponse($updatedData, 'Position updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Position not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to update position: ' . $e->getMessage());
            return $this->errorResponse('Failed to update position.');
        }
    }

    /**
     * Delete position by ID.
     *
     * @param string $id
     * @return array
     */
    public function deletePosition(string $id): array
    {
        try {
            $position = Position::findOrFail($id);

            \DB::transaction(function () use ($position) {
                $position->update(['deleted_by' => auth()->id()]);
                $position->delete();
            });

            return $this->successResponse(null, 'Position deleted successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Position not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete position: ' . $e->getMessage());
            return $this->errorResponse('Failed to delete position.');
        }
    }

    /**
     * Restore position by ID.
     *
     * @param string $id
     * @return array
     */
    public function restorePosition(string $id): array
    {
        try {
            $position = Position::onlyTrashed()->findOrFail($id);

            \DB::transaction(function () use ($position) {
                $position->restore();
                $position->update(['deleted_by' => null]);
            });

            return $this->successResponse(null, 'Position restored successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Position not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to restore position: ' . $e->getMessage());
            return $this->errorResponse('Failed to restore position.');
        }
    }

    /**
     * Force delete position by ID.
     *
     * @param string $id
     * @return array
     */
    public function forceDeletePosition(string $id): array
    {
        try {
            $position = Position::onlyTrashed()->findOrFail($id);

            \DB::transaction(function () use ($position) {
                $position->forceDelete();
            });

            return $this->successResponse(null, 'Position permanently deleted successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Position not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to force delete position: ' . $e->getMessage());
            return $this->errorResponse('Failed to permanently delete position.');
        }
    }
}
