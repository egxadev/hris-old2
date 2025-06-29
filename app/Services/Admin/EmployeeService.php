<?php

namespace App\Services\Admin;

use App\Models\Employee;
use App\Models\User;
use App\Traits\ResponseFormatter;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class EmployeeService
{
    use ResponseFormatter;

    private const DEFAULT_PER_PAGE = 10;
    private const DEFAULT_SORT_BY = 'employee_code';
    private const DEFAULT_SORT_DIR = 'asc';
    private const FILTERABLE_COLUMNS = ['employee_code', 'created_at'];

    /**
     * Get paginated employees with filters.
     *
     * @param array $filters
     * @return array
     */
    public function getPaginatedEmployees(array $filters): array
    {
        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $page = (int) ($filters['page'] ?? 1);
        $sortBy  = in_array($sort = $filters['sort_by'] ?? self::DEFAULT_SORT_BY, self::FILTERABLE_COLUMNS) ? $sort : self::DEFAULT_SORT_BY;
        $sortDir = in_array($dir = strtolower($filters['sort_dir'] ?? self::DEFAULT_SORT_DIR), ['asc', 'desc']) ? $dir : self::DEFAULT_SORT_DIR;

        $search = trim($filters['search'] ?? '');

        $query = Employee::with(['user', 'branch', 'department', 'position']);

        $query->when($search, function ($query) use ($search) {
            $query->where(function ($subQuery) use ($search) {
                foreach (self::FILTERABLE_COLUMNS as $column) {
                    $subQuery->orWhere($column, 'like', "%{$search}%");
                }
                // Search in related user's name
                $subQuery->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
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
     * Get employee by ID.
     *
     * @param string $id
     * @return array
     */
    public function getEmployeeById(string $id): array
    {
        $employee = Employee::with('region', 'branch', 'department', 'position')->findOrFail($id);
        return $this->successResponse($employee, 'Employee retrieved successfully.');
    }

    /**
     * Get employee with user by ID.
     *
     * @param string $id
     * @return array
     */
    public function getEmployeeWithUserById(string $id): array
    {
        $employee = Employee::with(['region', 'branch', 'department', 'position', 'user', 'user.roles'])->findOrFail($id);
        return $this->successResponse($employee, 'Employee retrieved successfully.');
    }

    /**
     * Create a new employee with user.
     *
     * @param array $data
     * @return array
     */
    public function createEmployeeWithUser(array $data): array
    {
        try {
            $createdData = DB::transaction(function () use ($data) {
                // Create user if user data is provided
                $userId = null;
                if (isset($data['user']) && !empty($data['user']['name']) && !empty($data['user']['email'])) {
                    $user = User::create([
                        'name'          => $data['user']['name'],
                        'email'         => $data['user']['email'],
                        'password'      => bcrypt($data['user']['password']),
                        'created_by'    => auth()->id(),
                    ]);
                    
                    if (isset($data['user']['roles']) && is_array($data['user']['roles'])) {
                        $user->assignRole($data['user']['roles']);
                    }
                    
                    $userId = $user->id;
                }
                
                // Create employee
                $employee = Employee::create([
                    'user_id'       => $userId,
                    'region_id'      => $data['region_id'],
                    'branch_id'      => $data['branch_id'],
                    'department_id'  => $data['department_id'],
                    'position_id'    => $data['position_id'],
                    'employee_code'  => $data['employee_code'],
                    'employee_type'  => $data['employee_type'],
                    'employee_status'=> $data['employee_status'] ?? 1,
                    'joined_at'      => $data['joined_at'],
                    'resigned_at'    => $data['resigned_at'] ?? null,
                    'nik'           => $data['nik'],
                    'npwp'          => $data['npwp'] ?? null,
                    'citizenship'   => $data['citizenship'],
                    'phone_number'  => $data['phone_number'],
                    'photo_path'    => $data['photo_path'] ?? null,
                    'address'       => $data['address'],
                    'birth_place'   => $data['birth_place'],
                    'birth_date'    => $data['birth_date'],
                    'gender'        => $data['gender'],
                    'blood_type'    => $data['blood_type'] ?? null,
                    'religion'      => $data['religion'],
                    'education'     => $data['education'],
                    'created_by'    => auth()->id(),
                ]);

                return $employee;
            });

            return $this->successResponse($createdData, 'Employee created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create employee: ' . $e->getMessage());
            return $this->errorResponse('Failed to create employee: ' . $e->getMessage());
        }
    }

    /**
     * Create a new employee.
     *
     * @param array $data
     * @return array
     */
    public function createEmployee(array $data): array
    {
        try {
            $createdData = DB::transaction(function () use ($data) {
                $employee = Employee::create([
                    'region_id'      => $data['region_id'],
                    'branch_id'      => $data['branch_id'],
                    'department_id'  => $data['department_id'],
                    'position_id'    => $data['position_id'],
                    'employee_code'  => $data['employee_code'],
                    'employee_type'  => $data['employee_type'],
                    'employee_status'=> $data['employee_status'] ?? 1,
                    'joined_at'      => $data['joined_at'],
                    'resigned_at'    => $data['resigned_at'] ?? null,
                    'nik'           => $data['nik'],
                    'npwp'          => $data['npwp'] ?? null,
                    'citizenship'   => $data['citizenship'],
                    'phone_number'  => $data['phone_number'],
                    'photo_path'    => $data['photo_path'] ?? null,
                    'address'       => $data['address'],
                    'birth_place'   => $data['birth_place'],
                    'birth_date'    => $data['birth_date'],
                    'gender'        => $data['gender'],
                    'blood_type'    => $data['blood_type'] ?? null,
                    'religion'      => $data['religion'],
                    'education'     => $data['education'],
                    'created_by'    => auth()->id(),
                ]);

                return $employee;
            });

            return $this->successResponse($createdData, 'Employee created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create employee: ' . $e->getMessage());
            return $this->errorResponse('Failed to create employee.');
        }
    }

    /**
     * Update employee with user.
     *
     * @param Employee $employee
     * @param array $data
     * @return array
     */
    public function updateEmployeeWithUser(Employee $employee, array $data): array
    {
        try {
            $updatedData = DB::transaction(function () use ($employee, $data) {
                // Update or create user if user data is provided
                if (isset($data['user']) && !empty($data['user']['name']) && !empty($data['user']['email'])) {
                    if ($employee->user_id) {
                        // Update existing user
                        $user = User::findOrFail($employee->user_id);
                        $userData = [
                            'name'          => $data['user']['name'],
                            'email'         => $data['user']['email'],
                            'updated_by'    => auth()->id(),
                        ];
                        
                        if (!empty($data['user']['password'])) {
                            $userData['password'] = bcrypt($data['user']['password']);
                        }
                        
                        $user->update($userData);
                        
                        if (isset($data['user']['roles']) && is_array($data['user']['roles'])) {
                            $user->syncRoles($data['user']['roles']);
                        }
                    } else {
                        // Create new user
                        $user = User::create([
                            'name'          => $data['user']['name'],
                            'email'         => $data['user']['email'],
                            'password'      => bcrypt($data['user']['password']),
                            'created_by'    => auth()->id(),
                        ]);
                        
                        if (isset($data['user']['roles']) && is_array($data['user']['roles'])) {
                            $user->assignRole($data['user']['roles']);
                        }
                        
                        $employee->user_id = $user->id;
                    }
                }
                
                // Update employee
                $employee->update([
                    'region_id'      => $data['region_id'],
                    'branch_id'      => $data['branch_id'],
                    'department_id'  => $data['department_id'],
                    'position_id'    => $data['position_id'],
                    'employee_code'  => $data['employee_code'],
                    'employee_type'  => $data['employee_type'],
                    'employee_status'=> $data['employee_status'] ?? 1,
                    'joined_at'      => $data['joined_at'],
                    'resigned_at'    => $data['resigned_at'] ?? null,
                    'nik'           => $data['nik'],
                    'npwp'          => $data['npwp'] ?? null,
                    'citizenship'   => $data['citizenship'],
                    'phone_number'  => $data['phone_number'],
                    'photo_path'    => $data['photo_path'] ?? null,
                    'address'       => $data['address'],
                    'birth_place'   => $data['birth_place'],
                    'birth_date'    => $data['birth_date'],
                    'gender'        => $data['gender'],
                    'blood_type'    => $data['blood_type'] ?? null,
                    'religion'      => $data['religion'],
                    'education'     => $data['education'],
                    'updated_by'    => auth()->id(),
                ]);
                
                return $employee;
            });

            return $this->successResponse($updatedData, 'Employee updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Employee not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to update employee: ' . $e->getMessage());
            return $this->errorResponse('Failed to update employee: ' . $e->getMessage());
        }
    }

    /**
     * Update employee.
     *
     * @param Employee $employee
     * @param array $data
     * @return Employee
     */
    public function updateEmployee(Employee $employee, array $data): array
    {
        try {
            $updatedData = DB::transaction(function () use ($employee, $data) {
                $employee->update([
                    'region_id'      => $data['region_id'],
                    'branch_id'      => $data['branch_id'],
                    'department_id'  => $data['department_id'],
                    'position_id'    => $data['position_id'],
                    'employee_code'  => $data['employee_code'],
                    'employee_type'  => $data['employee_type'],
                    'employee_status'=> $data['employee_status'] ?? 1,
                    'joined_at'      => $data['joined_at'],
                    'resigned_at'    => $data['resigned_at'] ?? null,
                    'nik'           => $data['nik'],
                    'npwp'          => $data['npwp'] ?? null,
                    'citizenship'   => $data['citizenship'],
                    'phone_number'  => $data['phone_number'],
                    'photo_path'    => $data['photo_path'] ?? null,
                    'address'       => $data['address'],
                    'birth_place'   => $data['birth_place'],
                    'birth_date'    => $data['birth_date'],
                    'gender'        => $data['gender'],
                    'blood_type'    => $data['blood_type'] ?? null,
                    'religion'      => $data['religion'],
                    'education'     => $data['education'],
                    'updated_by'    => auth()->id(),
                ]);
                
                return $employee;
            });

            return $this->successResponse($updatedData, 'Employee updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Employee not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to update employee: ' . $e->getMessage());
            return $this->errorResponse('Failed to update employee.');
        }
    }

    /**
     * Delete employee by ID.
     *
     * @param string $id
     * @return array
     */
    public function deleteEmployee(string $id): array
    {
        try {
            $employee = Employee::findOrFail($id);

            DB::transaction(function () use ($employee) {
                $employee->update(['deleted_by' => auth()->id()]);
                $employee->delete();
            });

            return $this->successResponse(null, 'Employee deleted successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Employee not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete employee: ' . $e->getMessage());
            return $this->errorResponse('Failed to delete employee.');
        }
    }
}
