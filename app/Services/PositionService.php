<?php

namespace App\Services;

use App\Models\Position;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PositionService
{
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

        $query = Position::query();

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
     * Create new position.
     *
     * @param array $data
     * @return array
     */
    public function createPosition(array $data): array
    {
        try {
            $position = \DB::transaction(function () use ($data) {
                $position = Position::create([
                    'department_id' => $data['department_id'],
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'created_by'    => auth()->id(),
                ]);

                return $position;
            });

            return [
                'success'   => true,
                'message'   => 'Position created successfully.',
                'position'    => $position,
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to create position: ' . $e->getMessage());
            return [
                'success'   => false,
                'message'   => 'Failed to create position.',
            ];
        }
    }

    /**
     * Update position data.
     *
     * @param Position $position
     * @param array $data
     * @return array
     */
    public function updatePosition(Position $position, array $data): array
    {
        try {
            $updateData = [
                'department_id' => $data['department_id'],
                'name'          => $data['name'],
                'code'          => $data['code'],
                'updated_by'    => auth()->id(),
            ];

            \DB::transaction(function () use ($position, $updateData, $data) {
                $position->update($updateData);
            });

            return [
                'success'   => true,
                'message'   => 'Position updated successfully.',
                'data'      => $position->fresh(),
            ];
        } catch (ModelNotFoundException $e) {
            return [
                'success'   => false,
                'message'   => 'Position not found.',
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to update position: ' . $e->getMessage());
            return [
                'success'   => false,
                'message'   => 'Failed to update position.',
            ];
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

            return \DB::transaction(function () use ($position) {
                $position->update(['deleted_by' => auth()->id()]);
                $position->delete();

                return [
                    'success'   => true,
                    'message'   => 'Position deleted successfully.'
                ];
            });
        } catch (ModelNotFoundException $e) {
            return [
                'success'   => false,
                'message'   => 'Position not found.'
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to delete position: ' . $e->getMessage());
            return [
                'success'   => false,
                'message'   => 'Failed to delete position.'
            ];
        }
    }
}
