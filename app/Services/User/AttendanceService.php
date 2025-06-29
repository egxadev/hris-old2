<?php

namespace App\Services\User;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\Branch;
use App\Traits\ResponseFormatter;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

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
        $sortBy = in_array($sort = $filters['sort_by'] ?? self::DEFAULT_SORT_BY, self::FILTERABLE_COLUMNS) ? $sort : self::DEFAULT_SORT_BY;
        $sortDir = in_array($dir = strtolower($filters['sort_dir'] ?? self::DEFAULT_SORT_DIR), ['asc', 'desc']) ? $dir : self::DEFAULT_SORT_DIR;
        $search = trim($filters['search'] ?? '');

        // Get the current user's employee ID
        $employeeId = Employee::where('user_id', auth()->id())->value('id');

        $query = Attendance::query()
            ->select([
                'id', 'employee_id', 'date', 'check_in_time', 
                'check_in_location', 'check_in_photo',
                'check_out_time', 'check_out_location', 'check_out_photo',
                'status', 'notes'
            ])
            ->with(['employee' => function($query) {
                $query->with('user:id,name');
            }]);
            
        // Only show the current user's attendances
        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($subQuery) use ($search) {
                foreach (self::FILTERABLE_COLUMNS as $column) {
                    $subQuery->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

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
     * Create a new attendance.
     *
     * @param array $data
     * @return array
     */
    public function createAttendance(array $data): array
    {
        try {
            $employee = $this->getEmployeeForCurrentUser();
            if (!$employee) {
                return $this->errorResponse('Employee record not found.');
            }
            
            // Periksa apakah karyawan memiliki branch
            if (!$employee->branch_id && (!$employee->department || !$employee->department->branch_id)) {
                return $this->errorResponse('Karyawan belum ditetapkan ke cabang manapun. Hubungi admin untuk menetapkan cabang.');
            }
            
            $today = $data['date'] ?? Carbon::now()->toDateString();
            Log::info("Processing attendance for date: {$today}, employee ID: {$employee->id}");
            
            // Determine if this is a night shift
            $isNightShift = $this->isNightShift($employee->id, $today);
            
            // Handle check-in request
            if (isset($data['check_in_time'])) {
                return $this->handleCheckIn($employee, $today, $data, $isNightShift);
            }
            
            // Handle check-out request
            if (isset($data['check_out_time'])) {
                return $this->handleCheckOut($employee, $today, $data, $isNightShift);
            }
            
            Log::warning('Invalid attendance data. Neither check-in nor check-out conditions met.');
            return $this->errorResponse('Invalid attendance data.');
        } catch (\Exception $e) {
            Log::error('Failed to create/update attendance: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return $this->errorResponse('Failed to record attendance: ' . $e->getMessage());
        }
    }
    
    /**
     * Get employee record for the current authenticated user.
     *
     * @return Employee|null
     */
    private function getEmployeeForCurrentUser()
    {
        $employee = Employee::where('user_id', auth()->id())
            ->with(['branch', 'department.branch'])
            ->first();
            
        if (!$employee) {
            Log::error('No employee record found for user ID: ' . auth()->id());
        } else {
            // Log informasi branch untuk debugging
            if ($employee->branch_id) {
                Log::info("Employee has direct branch assignment: {$employee->branch_id}");
            } elseif ($employee->department && $employee->department->branch_id) {
                Log::info("Employee has branch via department: {$employee->department->branch_id}");
            } else {
                Log::warning("Employee has no branch assignment (neither direct nor via department)");
            }
        }
        
        return $employee;
    }
    
    /**
     * Determine if the employee has a night shift for the given date.
     *
     * @param string $employeeId
     * @param string $date
     * @return bool
     */
    private function isNightShift(string $employeeId, string $date): bool
    {
        // Check today's schedule
        $schedule = Schedule::with('shift')
            ->where('employee_id', $employeeId)
            ->where('date', $date)
            ->first();
            
        if ($schedule && $schedule->shift && $schedule->shift->is_night_shift) {
            Log::info("Found night shift schedule for today: {$schedule->shift->name}");
            return true;
        }
        
        // If no night shift found for today, check yesterday's schedule
        $yesterday = Carbon::parse($date)->subDay()->toDateString();
        $yesterdaySchedule = Schedule::with('shift')
            ->where('employee_id', $employeeId)
            ->where('date', $yesterday)
            ->first();
            
        if ($yesterdaySchedule && $yesterdaySchedule->shift && $yesterdaySchedule->shift->is_night_shift) {
            Log::info("Found night shift schedule from yesterday: {$yesterdaySchedule->shift->name}");
            return true;
        }
        
        Log::info("No night shift found for date: {$date}");
        return false;
    }
    
    /**
     * Handle check-in request.
     *
     * @param Employee $employee
     * @param string $date
     * @param array $data
     * @param bool $isNightShift
     * @return array
     */
    private function handleCheckIn(Employee $employee, string $date, array $data, bool $isNightShift): array
    {
        Log::info("Processing check-in request for date: {$date}");
        
        // Check for any open attendance
        $openAttendance = $this->findOpenAttendance($employee->id);
        if ($openAttendance) {
            $openDate = Carbon::parse($openAttendance->date)->format('Y-m-d');
            
            if ($isNightShift || $openDate === $date) {
                return $this->errorResponse("You already have an active check-in from {$openDate}. Please check out first.");
            }
            
            return $this->errorResponse("You have an unclosed attendance from {$openDate}. Please check out from that attendance first.");
        }
        
        // Check if there's a completed attendance for today
        $completedAttendances = Attendance::where('employee_id', $employee->id)
            ->where('date', $date)
            ->whereNotNull('check_out_time')
            ->orderBy('check_out_time', 'desc')
            ->get();
            
        if ($completedAttendances->count() > 0) {
            // For the most recent completed attendance today
            $lastAttendance = $completedAttendances->first();
            
            // Check if this was a night shift that started yesterday and ended today
            $checkInTime = Carbon::parse($lastAttendance->date . ' ' . $lastAttendance->check_in_time);
            $checkOutTime = Carbon::parse($date . ' ' . $lastAttendance->check_out_time);
            
            // If check-in was yesterday (different date than check-out)
            if ($lastAttendance->date < $date) {
                $currentTime = isset($data['check_in_time']) 
                    ? Carbon::parse($date . ' ' . $data['check_in_time'])
                    : Carbon::now();
                
                // Allow check-in if it's been at least 2 hours since last check-out
                // (This is a configurable business rule - adjust as needed)
                $hoursSinceLastCheckout = $currentTime->diffInHours($checkOutTime);
                Log::info("Hours since last checkout: {$hoursSinceLastCheckout}");
                
                if ($hoursSinceLastCheckout < 2) {
                    return $this->errorResponse("You must wait at least 2 hours after your last check-out before checking in again.");
                }
                
                // Allow the check-in
                Log::info("Allowing new check-in after previous night shift that ended today");
            } else {
                // Same day check-in and check-out
                // Check if there's already a regular shift completed today
                return $this->errorResponse('You have already completed your attendance for today.');
            }
        }
        
        // Validate location if provided
        if (isset($data['check_in_location']) && !empty($data['check_in_location'])) {
            $locationValidation = $this->validateLocationWithBranch($employee, $data['check_in_location']);
            
            if (!$locationValidation['valid']) {
                Log::warning("Location validation failed: {$locationValidation['message']}");
                return $this->errorResponse($locationValidation['message']);
            }
            
            Log::info("Location validated: {$locationValidation['message']}");
        }
        
        // Create new check-in record
        $attendanceData = [
            'employee_id' => $employee->id,
            'date' => $date,
            'check_in_time' => $data['check_in_time'],
            'check_in_location' => $data['check_in_location'] ?? null,
            'check_in_photo' => $data['photo'] ?? null,
            'status' => $data['status'] ?? 'present',
            'notes' => $data['notes'] ?? null,
            'created_by' => auth()->id()
        ];
        
        $createdData = Attendance::create($attendanceData);
        Log::info("Created new check-in record with ID: {$createdData->id}");
        
        return $this->successResponse($createdData, 'Check-in recorded successfully.');
    }
    
    /**
     * Handle check-out request.
     *
     * @param Employee $employee
     * @param string $date
     * @param array $data
     * @param bool $isNightShift
     * @return array
     */
    private function handleCheckOut(Employee $employee, string $date, array $data, bool $isNightShift): array
    {
        Log::info("Processing check-out request for date: {$date}, isNightShift: " . ($isNightShift ? 'true' : 'false'));
        
        // Find the attendance record to check out from
        $attendanceToCheckOut = $this->findAttendanceForCheckOut($employee->id, $date, $isNightShift);
        
        if (!$attendanceToCheckOut) {
            Log::warning("No open attendance found for checkout");
            return $this->errorResponse('You need to check in first before checking out.');
        }
        
        if ($attendanceToCheckOut->check_out_time) {
            return $this->errorResponse('You have already checked out for this attendance.');
        }
        
        Log::info("Processing checkout for attendance ID: {$attendanceToCheckOut->id} from date: {$attendanceToCheckOut->date}");
        
        // Validate location if provided
        if (isset($data['check_out_location']) && !empty($data['check_out_location'])) {
            $locationValidation = $this->validateLocationWithBranch($employee, $data['check_out_location']);
            
            if (!$locationValidation['valid']) {
                Log::warning("Location validation failed: {$locationValidation['message']}");
                return $this->errorResponse($locationValidation['message']);
            }
            
            Log::info("Location validated: {$locationValidation['message']}");
        }
        
        // Update with check-out data
        $attendanceToCheckOut->check_out_time = $data['check_out_time'];
        $attendanceToCheckOut->check_out_location = $data['check_out_location'] ?? null;
        $attendanceToCheckOut->check_out_photo = $data['photo'] ?? null;
        $attendanceToCheckOut->updated_by = auth()->id();
        
        // Calculate worked minutes
        $checkInDate = $attendanceToCheckOut->date;
        $checkOutDate = $date;
        
        $checkInTime = Carbon::parse($checkInDate . ' ' . $attendanceToCheckOut->check_in_time);
        $checkOutTime = Carbon::parse($checkOutDate . ' ' . $data['check_out_time']);
        
        Log::info("Initial check-in time: " . $checkInTime->toDateTimeString());
        Log::info("Initial check-out time: " . $checkOutTime->toDateTimeString());
        
        // Handle night shift scenarios
        if ($isNightShift) {
            // Case 1: Check-in is from previous day (e.g., check-in at 22:00, check-out at 06:00 next day)
            if ($checkInDate < $checkOutDate) {
                // This is normal for night shift, no adjustment needed
                Log::info("Night shift spanning multiple days: check-in from previous day");
            } 
            // Case 2: Same day check-in and check-out, but check-out time is earlier (e.g., check-in at 22:00, check-out at 06:00 same day)
            else if ($checkOutTime->lt($checkInTime)) {
                // Add a day to check-out time to represent next day
                $checkOutTime->addDay();
                Log::info("Night shift adjustment: Added 1 day to check-out time: " . $checkOutTime->toDateTimeString());
            }
        } 
        // Regular shift but check-out appears earlier than check-in (likely data error)
        else if ($checkOutTime->lt($checkInTime)) {
            // If check-out time is earlier than check-in time on the same day
            // This is likely a data entry error or unusual situation
            
            // If the difference is very large (e.g., check-in at 22:00, check-out at 06:00)
            // it might be a night shift that wasn't properly marked
            if ($checkInTime->diffInHours($checkOutTime) > 12) {
                $checkOutTime->addDay();
                Log::info("Possible unmarked night shift detected. Added 1 day to check-out time: " . $checkOutTime->toDateTimeString());
            } else {
                // Small time difference might be a data entry error, but we'll still calculate correctly
                Log::warning("Check-out time is earlier than check-in time on same day. Possible data error.");
            }
        }
        
        // Calculate the difference in minutes
        $workedMinutes = $checkInTime->diffInMinutes($checkOutTime);
        
        Log::info("Final check-in time: " . $checkInTime->toDateTimeString());
        Log::info("Final check-out time: " . $checkOutTime->toDateTimeString());
        Log::info("Calculated worked minutes: " . $workedMinutes);
        
        // Ensure we always have a positive value for worked_minutes
        if ($workedMinutes < 0) {
            Log::warning("Negative worked minutes detected: {$workedMinutes}, converting to absolute value");
            $workedMinutes = abs($workedMinutes);
        }
        
        // Apply reasonable limits to catch potential calculation errors
        // For example, if worked minutes is more than 24 hours, it might be an error
        if ($workedMinutes > 24 * 60) {
            Log::warning("Unusually high worked minutes: {$workedMinutes} (over 24 hours). Check for calculation errors.");
        }
        
        $attendanceToCheckOut->worked_minutes = $workedMinutes;
        $attendanceToCheckOut->save();
        
        return $this->successResponse($attendanceToCheckOut, 'Check-out recorded successfully.');
    }
    
    /**
     * Find any open attendance for the employee.
     *
     * @param string $employeeId
     * @return Attendance|null
     */
    private function findOpenAttendance(string $employeeId)
    {
        return Attendance::where('employee_id', $employeeId)
            ->whereNotNull('check_in_time')
            ->whereNull('check_out_time')
            ->first();
    }
    
    /**
     * Find the appropriate attendance record for check-out.
     *
     * @param string $employeeId
     * @param string $date
     * @param bool $isNightShift
     * @return Attendance|null
     */
    private function findAttendanceForCheckOut(string $employeeId, string $date, bool $isNightShift)
    {
        // First try to find an attendance record for today
        $todayAttendance = Attendance::where('employee_id', $employeeId)
            ->where('date', $date)
            ->whereNotNull('check_in_time')
            ->whereNull('check_out_time')
            ->first();
        
        if ($todayAttendance) {
            Log::info('Found open attendance for today');
            return $todayAttendance;
        }
        
        // If not found and it's a night shift, check previous days
        if ($isNightShift) {
            // Try yesterday first
            $yesterday = Carbon::parse($date)->subDay()->toDateString();
            $yesterdayAttendance = Attendance::where('employee_id', $employeeId)
                ->where('date', $yesterday)
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->first();
            
            if ($yesterdayAttendance) {
                Log::info("Found open attendance from yesterday: {$yesterday}");
                return $yesterdayAttendance;
            }
            
            // If still not found, check for any open attendance
            $anyOpenAttendance = Attendance::where('employee_id', $employeeId)
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->orderBy('date', 'desc')
                ->first();
            
            if ($anyOpenAttendance) {
                Log::info("Found open attendance from: {$anyOpenAttendance->date}");
                return $anyOpenAttendance;
            }
        }
        
        return null;
    }

    /**
     * Validate if the employee's location is within the acceptable range of their branch.
     *
     * @param Employee $employee
     * @param string $locationString Format: "latitude,longitude"
     * @return array
     */
    private function validateLocationWithBranch(Employee $employee, string $locationString): array
    {
        // Get the branch associated with the employee
        $branch = null;
        
        // Prioritaskan branch dari employee langsung
        if ($employee->branch_id) {
            $branch = Branch::find($employee->branch_id);
        }
        
        // Jika tidak ada, coba dapatkan dari department
        if (!$branch && $employee->department && $employee->department->branch) {
            $branch = $employee->department->branch;
        }
        
        // Jika masih tidak ada branch
        if (!$branch) {
            return [
                'valid' => false,
                'message' => 'Employee is not assigned to any branch',
                'distance' => null
            ];
        }
        
        // Check if branch has location coordinates
        if ($branch->latitude === null || $branch->longitude === null) {
            return [
                'valid' => true, // Allow if branch doesn't have coordinates set
                'message' => 'Branch location not configured, attendance allowed',
                'distance' => null
            ];
        }
        
        // Parse the location string
        $locationParts = explode(',', $locationString);
        if (count($locationParts) !== 2) {
            return [
                'valid' => false,
                'message' => 'Invalid location format. Expected "latitude,longitude"',
                'distance' => null
            ];
        }
        
        $userLatitude = (float) trim($locationParts[0]);
        $userLongitude = (float) trim($locationParts[1]);
        
        // Calculate distance between user and branch
        $distance = $this->calculateDistance(
            $userLatitude, 
            $userLongitude, 
            (float) $branch->latitude, 
            (float) $branch->longitude
        );
        
        // Get the branch's geofence radius (default to 100m if not set)
        $maxDistanceMeters = $branch->geofence_radius ?? 100;
        
        // Check if within allowed distance
        if ($distance <= $maxDistanceMeters) {
            return [
                'valid' => true,
                'message' => 'Location verified',
                'distance' => $distance
            ];
        }
        
        return [
            'valid' => false,
            'message' => "You are {$distance}m away from your branch office. The maximum allowed distance is {$maxDistanceMeters}m.",
            'distance' => $distance
        ];
    }
    
    /**
     * Calculate distance between two coordinates using the Haversine formula.
     *
     * @param float $lat1
     * @param float $lon1
     * @param float $lat2
     * @param float $lon2
     * @return float Distance in meters
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        // Earth's radius in meters
        $earthRadius = 6371000;
        
        $lat1Rad = deg2rad($lat1);
        $lon1Rad = deg2rad($lon1);
        $lat2Rad = deg2rad($lat2);
        $lon2Rad = deg2rad($lon2);
        
        $latDelta = $lat2Rad - $lat1Rad;
        $lonDelta = $lon2Rad - $lon1Rad;
        
        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos($lat1Rad) * cos($lat2Rad) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }
}
