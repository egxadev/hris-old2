<?php

namespace App\Services\Admin;

use App\Models\Schedule;
use App\Models\Employee;
use App\Models\Shift;
use App\Traits\ResponseFormatter;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ScheduleService
{
    use ResponseFormatter;

    private const DEFAULT_PER_PAGE = 10;
    private const DEFAULT_SORT_BY = 'date';
    private const DEFAULT_SORT_DIR = 'asc';
    private const FILTERABLE_COLUMNS = ['date', 'created_at'];

    /**
     * Get paginated schedules with filters.
     *
     * @param array $filters
     * @return array
     */
    public function getPaginatedSchedules(array $filters): array
    {
        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $page = (int) ($filters['page'] ?? 1);
        $sortBy  = in_array($sort = $filters['sort_by'] ?? self::DEFAULT_SORT_BY, self::FILTERABLE_COLUMNS) ? $sort : self::DEFAULT_SORT_BY;
        $sortDir = in_array($dir = strtolower($filters['sort_dir'] ?? self::DEFAULT_SORT_DIR), ['asc', 'desc']) ? $dir : self::DEFAULT_SORT_DIR;

        $search = trim($filters['search'] ?? '');

        $query = Schedule::query();
        
        // Include relationships with nested user relationship
        $query->with(['employee.user', 'shift']);

        $query->when($search, function ($query) use ($search) {
            $query->whereHas('employee.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('shift', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('date', 'like', "%{$search}%");
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
     * Get schedule by ID.
     *
     * @param string $id
     * @return array
     */
    public function getScheduleById(string $id): array
    {
        $schedule = Schedule::with(['employee.user', 'shift'])->findOrFail($id);
        return $this->successResponse($schedule, 'Schedule retrieved successfully.');
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

    /**
     * Get all shifts for dropdown.
     *
     * @return array
     */
    public function getShiftsForDropdown(): array
    {
        $shifts = Shift::select('id', 'name')->orderBy('name')->get();
        return $this->successResponse($shifts, 'Shifts retrieved successfully.');
    }

    /**
     * Create a new schedule.
     *
     * @param array $data
     * @return array
     */
    public function createSchedule(array $data): array
    {
        try {
            $createdData = \DB::transaction(function () use ($data) {
                $schedule = Schedule::create([
                    'employee_id'       => $data['employee_id'],
                    'shift_id'          => $data['shift_id'],
                    'date'              => $data['date'],
                    'created_by'        => auth()->id()
                ]);

                return $schedule;
            });

            return $this->successResponse($createdData, 'Schedule created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create schedule: ' . $e->getMessage());
            return $this->errorResponse('Failed to create schedule.');
        }
    }

    /**
     * Update schedule.
     *
     * @param Schedule $schedule
     * @param array $data
     * @return array
     */
    public function updateSchedule(Schedule $schedule, array $data): array
    {
        try {
            $updatedData = \DB::transaction(function () use ($schedule, $data) {
                $schedule->update([
                    'employee_id'       => $data['employee_id'],
                    'shift_id'          => $data['shift_id'],
                    'date'              => $data['date'],
                    'updated_by'        => auth()->id()
                ]);
                return $schedule;
            });

            return $this->successResponse($updatedData, 'Schedule updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Schedule not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to update schedule: ' . $e->getMessage());
            return $this->errorResponse('Failed to update schedule.');
        }
    }

    /**
     * Delete schedule by ID.
     *
     * @param string $id
     * @return array
     */
    public function deleteSchedule(string $id): array
    {
        try {
            $schedule = Schedule::findOrFail($id);

            \DB::transaction(function () use ($schedule) {
                $schedule->update(['deleted_by' => auth()->id()]);
                $schedule->delete();
            });

            return $this->successResponse(null, 'Schedule deleted successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Schedule not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete schedule: ' . $e->getMessage());
            return $this->errorResponse('Failed to delete schedule.');
        }
    }
}
