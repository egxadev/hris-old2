<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class LocationVerificationService
{
    // Konstanta untuk threshold verifikasi
    private const CONFIDENCE_THRESHOLD = 60;
    private const ACCURACY_THRESHOLD = 50;
    private const ALTITUDE_CHANGE_THRESHOLD = 100;
    private const SPEED_THRESHOLD = 30;
    private const TIME_DIFF_THRESHOLD = 300; // 5 menit
    private const TRAVEL_SPEED_THRESHOLD = 55; // ~200 km/h
    
    // Daftar kata kunci yang mencurigakan untuk deteksi fake GPS
    private const SUSPICIOUS_KEYWORDS = [
        'mock', 'fake', 'gps', 'location', 'spoof', 'virtual', 
        'xposed', 'magisk', 'frida', 'cydia', 'supersu',
        'kingroot', 'oneclick', 'root', 'faker'
    ];

    /**
     * Verify location data to detect potential GPS spoofing
     * 
     * @param array $locationData
     * @param Request $request
     * @return array
     */
    public function verifyLocation(array $locationData, Request $request): array
    {
        $results = [
            'valid' => true,
            'confidence' => 100,
            'warnings' => [],
            'data' => $locationData
        ];

        // Validasi dasar koordinat lokasi
        if (!$this->validateBasicLocationData($locationData, $results)) {
            return $results;
        }

        // Pemeriksaan kritis: Mock location (Android)
        if ($this->isMockLocationDetected($locationData, $results)) {
            return $results;
        }

        // Pemeriksaan akurasi lokasi
        $this->checkLocationAccuracy($locationData, $results);
        
        // Pemeriksaan konsistensi ketinggian
        $this->checkAltitudeConsistency($locationData, $results);
        
        // Pemeriksaan kecepatan
        $this->checkSpeedConsistency($locationData, $results);
        
        // Pemeriksaan konsistensi geolokasi IP
        $this->checkIpGeolocationConsistency($locationData, $results);
        
        // Pemeriksaan sensor perangkat
        $this->checkDeviceSensors($locationData, $results);
        
        // Pemeriksaan informasi jaringan
        $this->checkNetworkInformation($locationData, $results);
        
        // Pemeriksaan konsistensi waktu
        $this->checkTimeConsistency($locationData, $results);
        
        // Pemeriksaan fingerprint perangkat
        $this->checkDeviceFingerprint($request, $results);
        
        // Pemeriksaan riwayat lokasi
        $this->checkLocationHistory($locationData, $results);

        // Validasi akhir confidence score
        if ($results['confidence'] <= self::CONFIDENCE_THRESHOLD) {
            $results['valid'] = false;
        }

        // Log aktivitas mencurigakan
        if (!$results['valid']) {
            $this->logSuspiciousActivity($locationData, $results, $request);
        }

        return $results;
    }
    
    /**
     * Validate basic location data
     */
    private function validateBasicLocationData(array $locationData, array &$results): bool
    {
        if (!isset($locationData['latitude']) || !isset($locationData['longitude']) || 
            !is_numeric($locationData['latitude']) || !is_numeric($locationData['longitude'])) {
            $results['valid'] = false;
            $results['warnings'][] = 'Invalid location format';
            $results['confidence'] = 0;
            return false;
        }
        
        return true;
    }
    
    /**
     * Check for mock location settings
     */
    private function isMockLocationDetected(array $locationData, array &$results): bool
    {
        if (isset($locationData['is_mocked']) && $locationData['is_mocked'] === true) {
            $results['valid'] = false;
            $results['warnings'][] = 'Mock location detected';
            $results['confidence'] = 0;
            return true;
        }
        
        return false;
    }
    
    /**
     * Check location accuracy
     */
    private function checkLocationAccuracy(array $locationData, array &$results): void
    {
        if (!isset($locationData['accuracy']) || $locationData['accuracy'] > self::ACCURACY_THRESHOLD) {
            $results['warnings'][] = 'Low location accuracy';
            $results['confidence'] -= 30;
        }
    }
    
    /**
     * Check altitude consistency
     */
    private function checkAltitudeConsistency(array $locationData, array &$results): void
    {
        if (isset($locationData['altitude']) && isset($locationData['previous_altitude'])) {
            $altitudeDiff = abs($locationData['altitude'] - $locationData['previous_altitude']);
            if ($altitudeDiff > self::ALTITUDE_CHANGE_THRESHOLD && 
                isset($locationData['time_diff']) && 
                $locationData['time_diff'] < 60) {
                $results['warnings'][] = 'Suspicious altitude change';
                $results['confidence'] -= 25;
            }
        }
    }
    
    /**
     * Check speed consistency
     */
    private function checkSpeedConsistency(array $locationData, array &$results): void
    {
        if (isset($locationData['speed']) && $locationData['speed'] > self::SPEED_THRESHOLD) {
            $results['warnings'][] = 'Suspicious movement speed';
            $results['confidence'] -= 25;
        }
    }
    
    /**
     * Check IP geolocation consistency
     */
    private function checkIpGeolocationConsistency(array $locationData, array &$results): void
    {
        if (isset($locationData['ip_country']) && isset($locationData['gps_country']) && 
            $locationData['ip_country'] !== $locationData['gps_country']) {
            $results['warnings'][] = 'IP location mismatch';
            $results['confidence'] -= 40;
        }
    }
    
    /**
     * Check device sensors
     */
    private function checkDeviceSensors(array $locationData, array &$results): void
    {
        if (isset($locationData['has_sensors'])) {
            if ($locationData['has_sensors'] === false) {
                $results['warnings'][] = 'Missing device sensors';
                $results['confidence'] -= 30;
            }
        }
    }
    
    /**
     * Check network information
     */
    private function checkNetworkInformation(array $locationData, array &$results): void
    {
        if (isset($locationData['network_type'])) {
            if ($locationData['network_type'] === 'vpn' || $locationData['network_type'] === 'proxy') {
                $results['warnings'][] = 'VPN/Proxy detected';
                $results['confidence'] -= 35;
            }
        }
    }
    
    /**
     * Check time consistency
     */
    private function checkTimeConsistency(array $locationData, array &$results): void
    {
        if (isset($locationData['device_time']) && isset($locationData['server_time'])) {
            $timeDiff = abs($locationData['device_time'] - $locationData['server_time']);
            if ($timeDiff > self::TIME_DIFF_THRESHOLD) {
                $results['warnings'][] = 'Device time mismatch';
                $results['confidence'] -= 30;
            }
        }
    }
    
    /**
     * Check device fingerprint
     */
    private function checkDeviceFingerprint(Request $request, array &$results): void
    {
        $userAgent = $request->header('User-Agent');
        if (strpos($userAgent, 'rooted') !== false || 
            strpos($userAgent, 'jailbreak') !== false ||
            $this->detectSuspiciousUserAgent($userAgent)) {
            $results['warnings'][] = 'Potentially modified device';
            $results['confidence'] -= 35;
        }
    }
    
    /**
     * Check location history
     */
    private function checkLocationHistory(array $locationData, array &$results): void
    {
        if (isset($locationData['previous_location'])) {
            $prevLat = $locationData['previous_location']['latitude'];
            $prevLng = $locationData['previous_location']['longitude'];
            $timeDiff = $locationData['previous_location']['time_diff'] ?? 300;
            
            $distance = $this->calculateDistance(
                $locationData['latitude'], 
                $locationData['longitude'], 
                $prevLat, 
                $prevLng
            );
            
            // Calculate impossible travel speed
            if ($timeDiff > 0) {
                $speedMps = $distance / $timeDiff;
                if ($speedMps > self::TRAVEL_SPEED_THRESHOLD) {
                    $results['warnings'][] = 'Impossible travel speed detected';
                    $results['confidence'] -= 60;
                }
            }
        }
    }
    
    /**
     * Log suspicious activity
     */
    private function logSuspiciousActivity(array $locationData, array $results, Request $request): void
    {
        Log::warning('Suspicious location data detected', [
            'data' => $locationData,
            'warnings' => $results['warnings'],
            'confidence' => $results['confidence'],
            'ip' => $request->ip(),
            'user_agent' => $request->header('User-Agent') ?? 'Unknown'
        ]);
    }

    /**
     * Detect suspicious user agents that may indicate fake GPS apps
     * 
     * @param string $userAgent
     * @return bool
     */
    private function detectSuspiciousUserAgent(string $userAgent): bool
    {
        $userAgent = strtolower($userAgent);
        
        foreach (self::SUSPICIOUS_KEYWORDS as $keyword) {
            if (strpos($userAgent, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
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
    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
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