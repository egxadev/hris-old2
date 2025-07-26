<?php

namespace App\Services\Admin;

use App\Models\Employee;
use App\Models\Attendance;
use App\Traits\ResponseFormatter;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AttendanceService
{
    use ResponseFormatter;

    private const DEFAULT_PER_PAGE = 10;
    private const DEFAULT_SORT_BY = 'date';
    private const DEFAULT_SORT_DIR = 'desc';
    private const FILTERABLE_COLUMNS = ['date', 'created_at'];

    /**
     * Get paginated attendances with filters.
     *
     * @param array $filters
     * @return array
     */
    public function getPaginatedAttendances(array $filters): array
    {
        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $page = (int) ($filters['page'] ?? 1);
        $sortBy  = in_array($sort = $filters['sort_by'] ?? self::DEFAULT_SORT_BY, self::FILTERABLE_COLUMNS) ? $sort : self::DEFAULT_SORT_BY;
        $sortDir = in_array($dir = strtolower($filters['sort_dir'] ?? self::DEFAULT_SORT_DIR), ['asc', 'desc']) ? $dir : self::DEFAULT_SORT_DIR;

        $search = trim($filters['search'] ?? '');
        $trashed = filter_var($filters['trashed'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $query = $trashed ? Attendance::onlyTrashed() : Attendance::query();

        $query->with(['employee' => function ($query) {
            $query->with('user:id,name');
        }]);

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
     * Get attendance by ID.
     *
     * @param string $id
     * @return array
     */
    public function getAttendanceById(string $id): array
    {
        $attendance = Attendance::with('employee.user')->findOrFail($id);
        return $this->successResponse($attendance, 'Attendance retrieved successfully.');
    }

    /**
     * Create a new attendance.
     *
     * @param array $data
     * @return array
     */
    public function createAttendance(array $data): array
    {
        try {
            $createdData = \DB::transaction(function () use ($data) {
                $attendance = Attendance::create([
                    'employee_id'   => $data['employee_id'],
                    'date'          => $data['date'],
                    'check_in_time' => $data['check_in_time'],
                    'check_in_location' => $data['check_in_location'],
                    'check_out_time' => $data['check_out_time'],
                    'check_out_location' => $data['check_out_location'],
                    'status'        => $data['status'],
                    'notes'         => $data['notes'],
                    'created_by'    => auth()->id()
                ]);

                return $attendance;
            });

            return $this->successResponse($createdData, 'Attendance created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create attendance: ' . $e->getMessage());
            return $this->errorResponse('Failed to create attendance.');
        }
    }

    /**
     * Update attendance.
     *
     * @param Attendance $attendance
     * @param array $data
     * @return Attendance
     */
    public function updateAttendance(Attendance $attendance, array $data): array
    {
        try {
            $updatedData = \DB::transaction(function () use ($attendance, $data) {
                $attendance->update([
                    'employee_id'   => $data['employee_id'],
                    'date'          => $data['date'],
                    'check_in_time' => $data['check_in_time'],
                    'check_in_location' => $data['check_in_location'],
                    'check_out_time' => $data['check_out_time'],
                    'check_out_location' => $data['check_out_location'],
                    'status'        => $data['status'],
                    'notes'         => $data['notes'],
                    'updated_by'    => auth()->id()
                ]);
                return $attendance;
            });

            return $this->successResponse($updatedData, 'Attendance updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Attendance not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to update attendance: ' . $e->getMessage());
            return $this->errorResponse('Failed to update attendance.');
        }
    }

    /**
     * Delete attendance by ID.
     *
     * @param string $id
     * @return array
     */
    public function deleteAttendance(string $id): array
    {
        try {
            $attendance = Attendance::findOrFail($id);

            \DB::transaction(function () use ($attendance) {
                $attendance->update(['deleted_by' => auth()->id()]);
                $attendance->delete();
            });

            return $this->successResponse(null, 'Attendance deleted successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Attendance not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete attendance: ' . $e->getMessage());
            return $this->errorResponse('Failed to delete attendance.');
        }
    }

    /**
     * Restore attendance by ID.
     *
     * @param string $id
     * @return array
     */
    public function restoreAttendance(string $id): array
    {
        try {
            $attendance = Attendance::onlyTrashed()->findOrFail($id);

            \DB::transaction(function () use ($attendance) {
                $attendance->restore();
                $attendance->update(['deleted_by' => null]);
            });

            return $this->successResponse(null, 'Attendance restored successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Attendance not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to restore attendance: ' . $e->getMessage());
            return $this->errorResponse('Failed to restore attendance.');
        }
    }

    /**
     * Force delete attendance by ID.
     *
     * @param string $id
     * @return array
     */
    public function forceDeleteAttendance(string $id): array
    {
        try {
            $attendance = Attendance::onlyTrashed()->findOrFail($id);

            \DB::transaction(function () use ($attendance) {
                $attendance->forceDelete();
            });

            return $this->successResponse(null, 'Attendance permanently deleted successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Attendance not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to force delete attendance: ' . $e->getMessage());
            return $this->errorResponse('Failed to permanently delete attendance.');
        }
    }

    /**
     * Get all employees for dropdown.
     *
     * @return array
     */
    public function getEmployeesForDropdown(): array
    {
        $employees = Employee::with('user:id,name')
            ->select('employees.id', 'employees.user_id')
            ->join('users', 'employees.user_id', '=', 'users.id')
            ->orderBy('users.name')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name
                ];
            });

        return $this->successResponse($employees, 'Employees retrieved successfully.');
    }
}
