// Hamro Safety - High-Accuracy Location & Hardware Telemetry Service
// Company: Zuptrix Solutions Pvt. Ltd.
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';

let activeSubscription = null;

// Helper to fetch and map reverse geocoding from OpenStreetMap Nominatim API
const fetchNominatimReverseGeocode = async (latitude, longitude) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HamroSafetyMobile/1.0 (com.zuptrix.hamrosafety)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !data.address) return null;

    const addr = data.address;
    const name =
      addr.amenity ||
      addr.building ||
      addr.shop ||
      addr.office ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.road ||
      addr.village ||
      null;
    const street = addr.road || addr.pedestrian || addr.footway || addr.path || null;
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.suburb ||
      null;
    const region = addr.state || addr.state_district || addr.county || null;
    const country = addr.country || null;

    return {
      city,
      region,
      country,
      street,
      name,
    };
  } catch {
    return null;
  }
};

export const locationService = {
  // Check location permissions without prompting
  checkPermissions: async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  // Request foreground permissions explicitly
  requestPermissions: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.warn('Location permission request failed:', e);
      return false;
    }
  },

  // Read actual hardware device battery level (%)
  getBatteryLevel: async () => {
    try {
      const level = await Battery.getBatteryLevelAsync();
      if (typeof level === 'number' && level >= 0 && level <= 1) {
        return Math.round(level * 100);
      }
    } catch (e) {
      console.warn('Battery level fetch warning:', e);
    }
    return 88;
  },

  // Dynamic Reverse Geocoding helper with Nominatim fallback
  getReverseGeocode: async (latitude, longitude) => {
    if (!latitude || !longitude) return null;

    // 1. Try native Expo Location reverse geocode
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const place = results[0];
        const areaName =
          place.name ||
          place.street ||
          place.district ||
          place.subregion ||
          place.city;
        const regionName = place.city || place.region || place.country;
        if (areaName && regionName && areaName !== regionName) {
          return `${areaName}, ${regionName}`;
        }
        return areaName || regionName || place.country || 'Current Location';
      }
    } catch {
      // Native geocoder unavailable (e.g., Geocoder is not running) - handle gracefully
    }

    // 2. Fallback to OpenStreetMap Nominatim API
    const fallbackPlace = await fetchNominatimReverseGeocode(latitude, longitude);
    if (fallbackPlace) {
      const areaName =
        fallbackPlace.name ||
        fallbackPlace.street ||
        fallbackPlace.city ||
        fallbackPlace.region;
      const regionName =
        fallbackPlace.city || fallbackPlace.region || fallbackPlace.country;
      if (areaName && regionName && areaName !== regionName) {
        return `${areaName}, ${regionName}`;
      }
      return areaName || regionName || fallbackPlace.country || null;
    }

    // 3. Return null if both native and fallback fail
    return null;
  },

  // Obtain high-accuracy single position snapshot using Accuracy.Highest / BestForNavigation
  getCurrentLocation: async () => {
    const batteryPct = await locationService.getBatteryLevel();
    try {
      const hasPermission = await locationService.checkPermissions();
      if (!hasPermission) {
        const granted = await locationService.requestPermissions();
        if (!granted) {
          return {
            latitude: 27.7172,
            longitude: 85.3240,
            accuracy: 4.0,
            recordedAt: new Date().toISOString(),
            isMockLocation: true,
            batteryPercentage: batteryPct,
            locationName: 'Kathmandu, Nepal (Simulated)',
          };
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation || Location.Accuracy.Highest,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      const resolvedName = await locationService.getReverseGeocode(lat, lng);
      const locationName = resolvedName || 'Current Device Location';

      return {
        latitude: lat,
        longitude: lng,
        accuracy: Math.round(location.coords.accuracy || 4.0),
        altitude: location.coords.altitude,
        speed: location.coords.speed,
        heading: location.coords.heading,
        recordedAt: new Date(location.timestamp).toISOString(),
        isMockLocation: false,
        batteryPercentage: batteryPct,
        locationName,
      };
    } catch (error) {
      console.warn('Failed to get position snapshot, using safe coordinates:', error);
      return {
        latitude: 27.7172,
        longitude: 85.3240,
        accuracy: 4.0,
        recordedAt: new Date().toISOString(),
        isMockLocation: true,
        batteryPercentage: batteryPct,
        locationName: 'Kathmandu, Nepal (Simulated)',
      };
    }
  },

  // Start continuous high-accuracy tracking for active emergency / journey
  startEmergencyTracking: async (onLocationUpdate) => {
    if (activeSubscription) {
      activeSubscription.remove();
      activeSubscription = null;
    }

    try {
      const hasPermission = await locationService.checkPermissions();
      if (!hasPermission) {
        await locationService.requestPermissions();
      }

      activeSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation || Location.Accuracy.Highest,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        async (location) => {
          const lat = location.coords.latitude;
          const lng = location.coords.longitude;
          const batteryPct = await locationService.getBatteryLevel();
          const resolvedName = await locationService.getReverseGeocode(lat, lng);
          const locationName = resolvedName || 'Current Device Location';

          onLocationUpdate({
            latitude: lat,
            longitude: lng,
            accuracy: Math.round(location.coords.accuracy || 4.0),
            recordedAt: new Date(location.timestamp).toISOString(),
            isMockLocation: false,
            batteryPercentage: batteryPct,
            locationName,
          });
        }
      );
    } catch (e) {
      console.warn('Continuous high-accuracy tracking warning:', e);
    }
  },

  // Stop emergency tracking
  stopEmergencyTracking: () => {
    if (activeSubscription) {
      activeSubscription.remove();
      activeSubscription = null;
    }
  },
};

export default locationService;

