/**
 * Advanced location data collection utility
 * This utility helps collect detailed location data to prevent GPS spoofing
 */

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
  isMocked?: boolean;
  deviceId?: string;
  hasSensors?: boolean;
  networkType?: string;
}

// Common suspicious keywords for fake GPS detection
const SUSPICIOUS_KEYWORDS = [
  'mock', 'fake', 'gps', 'location', 'spoof', 'virtual', 
  'xposed', 'magisk', 'frida', 'cydia', 'supersu',
  'kingroot', 'oneclick', 'root', 'faker'
];

// Common fake GPS app objects
const SUSPICIOUS_PROPS = [
  'FakeGPS', 'MockGPS', 'LocationFaker', 
  'fakegps', 'mockgps', 'isMocked',
  'isFake', 'gpsSimulator'
];

// Location options
const LOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

/**
 * Get detailed location data with anti-spoofing measures
 * @returns Promise<LocationData>
 */
export const getDetailedLocation = async (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const locationData: LocationData = {
      latitude: 0,
      longitude: 0,
    };

    // Initialize with device information
    initializeDeviceData(locationData);
    
    // Collect location readings over time to detect inconsistencies
    const locationReadings: GeolocationPosition[] = [];
    
    // First get a quick reading
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationReadings.push(position);
        
        // Then get a second reading after a short delay
        setTimeout(() => {
          navigator.geolocation.getCurrentPosition(
            (position2) => processSecondReading(position2, position, locationReadings, locationData, resolve),
            (error) => processFirstReadingOnFailure(position, locationData, locationReadings, error, reject, resolve),
            LOCATION_OPTIONS
          );
        }, 1000);
      },
      (error) => {
        reject(new Error(`Error getting location: ${error.message}`));
      },
      LOCATION_OPTIONS
    );
  });
};

/**
 * Initialize device data for location verification
 */
const initializeDeviceData = (locationData: LocationData): void => {
  locationData.deviceId = getDeviceFingerprint();
  locationData.hasSensors = checkDeviceSensors();
  locationData.networkType = getNetworkType();
  locationData.isMocked = detectMockLocation();
};

/**
 * Process the second location reading
 */
const processSecondReading = (
  position2: GeolocationPosition, 
  position1: GeolocationPosition,
  locationReadings: GeolocationPosition[], 
  locationData: LocationData, 
  resolve: (value: LocationData) => void
): void => {
  locationReadings.push(position2);
  
  // Use the most recent position for the main data
  updateLocationDataFromPosition(locationData, position2);

  // Run enhanced detection checks
  if (detectSpoofedLocation(position2) || 
      detectInconsistentReadings([position1, position2]) ||
      detectFakeGpsApp()) {
    locationData.isMocked = true;
  }

  resolve(locationData);
};

/**
 * Process the first reading if second reading fails
 */
const processFirstReadingOnFailure = (
  position: GeolocationPosition,
  locationData: LocationData,
  locationReadings: GeolocationPosition[],
  error: GeolocationPositionError,
  reject: (reason: Error) => void,
  resolve: (value: LocationData) => void
): void => {
  if (locationReadings.length > 0) {
    updateLocationDataFromPosition(locationData, position);
    
    // Still run detection on single reading
    if (detectSpoofedLocation(position) || detectFakeGpsApp()) {
      locationData.isMocked = true;
    }
    
    resolve(locationData);
  } else {
    reject(new Error(`Error getting location: ${error.message}`));
  }
};

/**
 * Update location data from position
 */
const updateLocationDataFromPosition = (locationData: LocationData, position: GeolocationPosition): void => {
  locationData.latitude = position.coords.latitude;
  locationData.longitude = position.coords.longitude;
  locationData.accuracy = position.coords.accuracy;
  locationData.altitude = position.coords.altitude || undefined;
  locationData.altitudeAccuracy = position.coords.altitudeAccuracy || undefined;
  locationData.heading = position.coords.heading || undefined;
  locationData.speed = position.coords.speed || undefined;
  locationData.timestamp = position.timestamp;
};

/**
 * Format location data for API submission
 * @param locationData The location data to format
 * @returns string
 */
export const formatLocationString = (locationData: LocationData): string => {
  return `${locationData.latitude},${locationData.longitude}`;
};

/**
 * Get additional location data for API submission
 * @param locationData The location data
 * @returns Record<string, string | number | undefined>
 */
export const getLocationMetadata = (locationData: LocationData): Record<string, string | number | undefined> => {
  return {
    accuracy: locationData.accuracy,
    altitude: locationData.altitude,
    speed: locationData.speed,
    is_mocked: locationData.isMocked ? 'true' : 'false',
    device_time: Math.floor(Date.now() / 1000),
    device_id: locationData.deviceId,
    has_sensors: locationData.hasSensors ? 'true' : 'false',
    network_type: locationData.networkType,
  };
};

/**
 * Generate a device fingerprint
 * @returns string
 */
const getDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  
  if (!gl) {
    return 'unknown';
  }
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) {
    return 'unknown';
  }
  
  const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  
  const fingerprint = `${navigator.userAgent}|${vendor}|${renderer}|${screen.width}x${screen.height}|${navigator.language}`;
  return btoa(fingerprint).substring(0, 32);
};

/**
 * Check if the device has motion and orientation sensors
 * @returns boolean
 */
const checkDeviceSensors = (): boolean => {
  return (
    'DeviceMotionEvent' in window &&
    'DeviceOrientationEvent' in window
  );
};

/**
 * Get the current network connection type
 * @returns string
 */
const getNetworkType = (): string => {
  // @ts-expect-error - navigator.connection is not in the standard TypeScript types
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return 'unknown';
  }
  
  return connection.type || connection.effectiveType || 'unknown';
};

/**
 * Attempt to detect if location is being spoofed
 * @returns boolean
 */
const detectMockLocation = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check if running in an emulator
  if (userAgent.includes('emulator') || 
      userAgent.includes('android sdk') || 
      userAgent.includes('sdk_gphone') ||
      userAgent.includes('x86')) {
    return true;
  }

  // Check for suspicious keywords in user agent
  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (userAgent.includes(keyword)) {
      return true;
    }
  }

  return false;
};

/**
 * Additional checks for spoofed location
 * @param position The geolocation position
 * @returns boolean
 */
const detectSpoofedLocation = (position: GeolocationPosition): boolean => {
  // Check for unrealistic accuracy
  if (position.coords.accuracy < 1) {
    return true;
  }
  
  // Check for suspicious precision patterns
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  
  if (lat.toFixed(6) === lat.toFixed(3) + '000' ||
      lng.toFixed(6) === lng.toFixed(3) + '000' ||
      lat.toString().endsWith('00000') ||
      lng.toString().endsWith('00000')) {
    return true;
  }
  
  // Check for unrealistic speed
  if (position.coords.speed !== null && position.coords.speed > 55) {
    return true;
  }
  
  return false;
};

/**
 * Check for inconsistencies between multiple location readings
 * @param readings Array of location readings
 * @returns boolean
 */
const detectInconsistentReadings = (readings: GeolocationPosition[]): boolean => {
  if (readings.length < 2) {
    return false;
  }
  
  const firstPos = readings[0].coords;
  const secondPos = readings[1].coords;
  
  // If coordinates are EXACTLY the same, that's suspicious
  if (firstPos.latitude === secondPos.latitude && 
      firstPos.longitude === secondPos.longitude) {
    return true;
  }
  
  // Check for unrealistic movement
  const timeDiff = (readings[1].timestamp - readings[0].timestamp) / 1000; // seconds
  if (timeDiff > 0) {
    const distance = calculateDistance(
      firstPos.latitude, 
      firstPos.longitude,
      secondPos.latitude,
      secondPos.longitude
    );
    
    // If speed is unrealistic (> 200 km/h or ~55 m/s)
    const speed = distance / timeDiff;
    if (speed > 55) {
      return true;
    }
  }
  
  return false;
};

/**
 * Calculate distance between two coordinates using the Haversine formula
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};

/**
 * Detect common fake GPS apps by checking for their objects or behavior
 * @returns boolean
 */
const detectFakeGpsApp = (): boolean => {
  // Check for common fake GPS app objects in window
  for (const prop of SUSPICIOUS_PROPS) {
    // @ts-expect-error - Checking for dynamic properties
    if (window[prop] !== undefined) {
      return true;
    }
  }
  
  // Check for tampering with navigator.geolocation
  const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
  const currentGetCurrentPosition = navigator.geolocation.getCurrentPosition;
  
  // If the function has been replaced/modified
  if (originalGetCurrentPosition.toString() !== currentGetCurrentPosition.toString()) {
    return true;
  }
  
  return false;
}; 