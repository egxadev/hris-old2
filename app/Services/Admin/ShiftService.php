<?php

namespace App\Services\Admin;

use App\Models\Shift;
use App\Traits\ResponseFormatter;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ShiftService
{
    use ResponseFormatter;

    private const DEFAULT_PER_PAGE = 10;
    private const DEFAULT_SORT_BY = 'name';
    private const DEFAULT_SORT_DIR = 'asc';
    private const FILTERABLE_COLUMNS = ['name', 'start_time', 'end_time', 'is_night_shift', 'created_at'];

    /**
     * Get paginated shifts with filters.
     *
     * @param array $filters
     * @return array
     */
    public function getPaginatedShifts(array $filters): array
    {
        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $page = (int) ($filters['page'] ?? 1);
        $sortBy  = in_array($sort = $filters['sort_by'] ?? self::DEFAULT_SORT_BY, self::FILTERABLE_COLUMNS) ? $sort : self::DEFAULT_SORT_BY;
        $sortDir = in_array($dir = strtolower($filters['sort_dir'] ?? self::DEFAULT_SORT_DIR), ['asc', 'desc']) ? $dir : self::DEFAULT_SORT_DIR;

        $search = trim($filters['search'] ?? '');

        $query = Shift::query();

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
     * Get shift by ID.
     *
     * @param string $id
     * @return array
     */
    public function getShiftById(string $id): array
    {
        $shift = Shift::findOrFail($id);
        return $this->successResponse($shift, 'Shift retrieved successfully.');
    }

    /**
     * Create a new shift.
     *
     * @param array $data
     * @return array
     */
    public function createShift(array $data): array
    {
        try {
            $createdData = \DB::transaction(function () use ($data) {
                $shift = Shift::create([
                    'name'              => $data['name'],
                    'start_time'        => $data['start_time'],
                    'end_time'          => $data['end_time'],
                    'grace_period_in'   => $data['grace_period_in'],
                    'grace_period_out'  => $data['grace_period_out'],
                    'is_night_shift'    => $data['is_night_shift'],
                    'created_by'        => auth()->id()
                ]);

                return $shift;
            });

            return $this->successResponse($createdData, 'Shift created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create shift: ' . $e->getMessage());
            return $this->errorResponse('Failed to create shift.');
        }
    }

    /**
     * Update shift.
     *
     * @param Shift $shift
     * @param array $data
     * @return array
     */
    public function updateShift(Shift $shift, array $data): array
    {
        try {
            $updatedData = \DB::transaction(function () use ($shift, $data) {
                $shift->update([
                    'name'              => $data['name'],
                    'start_time'        => $data['start_time'],
                    'end_time'          => $data['end_time'],
                    'grace_period_in'   => $data['grace_period_in'],
                    'grace_period_out'  => $data['grace_period_out'],
                    'is_night_shift'    => $data['is_night_shift'],
                    'updated_by'        => auth()->id()
                ]);
                return $shift;
            });

            return $this->successResponse($updatedData, 'Shift updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Shift not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to update shift: ' . $e->getMessage());
            return $this->errorResponse('Failed to update shift.');
        }
    }

    /**
     * Delete shift by ID.
     *
     * @param string $id
     * @return array
     */
    public function deleteShift(string $id): array
    {
        try {
            $shift = Shift::findOrFail($id);

            \DB::transaction(function () use ($shift) {
                $shift->update(['deleted_by' => auth()->id()]);
                $shift->delete();
            });

            return $this->successResponse(null, 'Shift deleted successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Shift not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete shift: ' . $e->getMessage());
            return $this->errorResponse('Failed to delete shift.');
        }
    }
}
