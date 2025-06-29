<?php

namespace App\Http\Controllers\User;

use App\Models\Employee;
use App\Models\LocationVerification;
use Illuminate\Http\Request;
use App\Services\User\AttendanceService;
use App\Services\LocationVerificationService;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\AttendanceRequest;

class AttendanceController extends Controller
{
    protected $attendanceService;
    protected $locationVerificationService;

    public function __construct(
        AttendanceService $attendanceService,
        LocationVerificationService $locationVerificationService
    ) {
        $this->attendanceService = $attendanceService;
        $this->locationVerificationService = $locationVerificationService;
    }

    /**
     * Display a listing of the resource.
     */
    public function history(Request $request)
    {
        $breadcrumbs = [
            [
                'title' => 'Attendance',
                'href' => route('user.attendances.history')
            ],
            [
                'title' => 'History',
                'href' => route('user.attendances.history')
            ]
        ];

        $data = $this->attendanceService->getPaginatedAttendances($request->all());

        return inertia('user/attendances/history/index', array_merge(
            ['breadcrumbs' => $breadcrumbs],
            $data
        ));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function checkin()
    {
        $breadcrumbs = [
            [
                'title' => 'Attendance',
                'href' => route('user.attendances.checkin')
            ],
            [
                'title' => 'Check In',
                'href' => route('user.attendances.checkin')
            ]
        ];

        return inertia('user/attendances/checkin/create', [
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function checkout()
    {
        $breadcrumbs = [
            [
                'title' => 'Attendance',
                'href' => route('user.attendances.checkout')
            ],
            [
                'title' => 'Check Out',
                'href' => route('user.attendances.checkout')
            ]
        ];

        return inertia('user/attendances/checkout/create', [
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    /**
     * Store a newly created check-in record.
     */
    public function storeCheckin(AttendanceRequest $request)
    {
        return $this->processAttendanceRequest($request, 'checkin');
    }

    /**
     * Store a check-out record.
     */
    public function storeCheckout(AttendanceRequest $request)
    {
        return $this->processAttendanceRequest($request, 'checkout');
    }
    
    /**
     * Process attendance request (check-in or check-out)
     * 
     * @param AttendanceRequest $request
     * @param string $type Either 'checkin' or 'checkout'
     * @return \Illuminate\Http\RedirectResponse
     */
    private function processAttendanceRequest(AttendanceRequest $request, string $type)
    {
        try {
            // Find the employee associated with the current user
            $employee = Employee::where('user_id', auth()->id())
                ->with(['branch', 'department.branch'])
                ->first();
            
            if (!$employee) {
                return redirect()->route("user.attendances.{$type}")->with('error', 'Employee record not found for the current user.');
            }
            
            // Periksa apakah karyawan memiliki branch
            if (!$employee->branch_id && (!$employee->department || !$employee->department->branch_id)) {
                return redirect()->route("user.attendances.{$type}")->with('error', 'You have not been assigned to any branch. Please contact the admin to set your branch.');
            }
            
            // Extract location data from the request
            $locationData = $this->extractLocationData($request);
            
            // Verify location data for anti-spoofing
            $verificationResult = $this->locationVerificationService->verifyLocation($locationData, $request);
            
            // Store location verification record
            $locationVerification = $this->storeLocationVerification($employee, $locationData, $verificationResult);
            
            // If location verification fails, return error
            if (!$verificationResult['valid']) {
                $warningMessage = implode(', ', $verificationResult['warnings']);
                return redirect()->route("user.attendances.{$type}")->with('error', "Location verification failed: {$warningMessage}");
            }

            $data = $request->validated();
            $data['employee_id'] = $employee->id;
            
            // Set default values based on type
            if ($type === 'checkin') {
                $data['status'] = 'present'; // Default status for check-in
            } else {
                $data['check_out_time'] = $data['check_out_time'] ?? now()->format('H:i:s');
                
                // Ensure date is set for finding the existing attendance record
                if (!isset($data['date'])) {
                    $data['date'] = now()->toDateString();
                }
            }

            $response = $this->attendanceService->createAttendance($data);

            if ($response['success']) {
                // Update location verification with attendance ID
                if (isset($response['data']) && isset($response['data']['id'])) {
                    $locationVerification->attendance_id = $response['data']['id'];
                    $locationVerification->save();
                }
                
                $successMessage = $type === 'checkin' ? 'Check-in recorded successfully.' : 'Check-out recorded successfully.';

                return redirect()->route('user.attendances.history')->with('success', $successMessage);
            } else {
                return redirect()->route("user.attendances.{$type}")->with('error', $response['message']);
            }
        } catch (\Exception $e) {
            \Log::error("Exception in store{$type}: " . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return redirect()->route("user.attendances.{$type}")->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Extract location data from the request
     * 
     * @param Request $request
     * @return array
     */
    private function extractLocationData(Request $request): array
    {
        // Initialize with basic data
        $locationData = [
            'server_time' => time(),
            'is_mocked' => $request->input('is_mocked') === 'true',
        ];
        
        // Map request fields directly to location data
        $fieldsToMap = [
            'accuracy', 'altitude', 'speed', 'device_time', 
            'device_id', 'network_type'
        ];
        
        foreach ($fieldsToMap as $field) {
            if ($request->has($field)) {
                $locationData[$field] = $request->input($field);
            }
        }
        
        // Handle boolean field
        $locationData['has_sensors'] = $request->input('has_sensors') === 'true';
        
        // Extract coordinates from location string
        if ($request->has('check_in_location')) {
            $this->extractCoordinates($request->check_in_location, $locationData);
        } elseif ($request->has('check_out_location')) {
            $this->extractCoordinates($request->check_out_location, $locationData);
        }
        
        // Get previous location data (for comparison)
        $this->addPreviousLocationData($locationData);
        
        return $locationData;
    }
    
    /**
     * Extract coordinates from location string
     * 
     * @param string $locationString
     * @param array &$locationData
     * @return void
     */
    private function extractCoordinates(string $locationString, array &$locationData): void
    {
        $locationParts = explode(',', $locationString);
        if (count($locationParts) >= 2) {
            $locationData['latitude'] = (float) trim($locationParts[0]);
            $locationData['longitude'] = (float) trim($locationParts[1]);
        }
    }
    
    /**
     * Add previous location data for comparison
     * 
     * @param array &$locationData
     * @return void
     */
    private function addPreviousLocationData(array &$locationData): void
    {
        $employee = Employee::where('user_id', auth()->id())->first();
        if (!$employee) {
            return;
        }
        
        $previousVerification = LocationVerification::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->first();
            
        if (!$previousVerification) {
            return;
        }
        
        $locationData['previous_location'] = [
            'latitude' => $previousVerification->latitude,
            'longitude' => $previousVerification->longitude,
            'time_diff' => now()->diffInSeconds($previousVerification->created_at)
        ];
        
        if ($previousVerification->altitude) {
            $locationData['previous_altitude'] = $previousVerification->altitude;
            $locationData['time_diff'] = now()->diffInSeconds($previousVerification->created_at);
        }
    }
    
    /**
     * Store location verification data
     * 
     * @param Employee $employee
     * @param array $locationData
     * @param array $verificationResult
     * @return LocationVerification
     */
    private function storeLocationVerification(Employee $employee, array $locationData, array $verificationResult): LocationVerification
    {
        return LocationVerification::create([
            'employee_id' => $employee->id,
            'latitude' => $locationData['latitude'] ?? 0,
            'longitude' => $locationData['longitude'] ?? 0,
            'accuracy' => $locationData['accuracy'] ?? null,
            'altitude' => $locationData['altitude'] ?? null,
            'speed' => $locationData['speed'] ?? null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'device_id' => $locationData['device_id'] ?? null,
            'network_type' => $locationData['network_type'] ?? null,
            'raw_data' => $locationData,
            'verification_results' => $verificationResult,
            'is_valid' => $verificationResult['valid'],
            'confidence_score' => $verificationResult['confidence'],
        ]);
    }
}
