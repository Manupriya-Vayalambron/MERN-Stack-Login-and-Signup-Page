// Location utilities for distance calculation and location tracking
// Using Haversine formula for distance calculation without external APIs

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance; // Distance in kilometers
};

export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(2)}km`;
};

export const calculateETA = (distance, averageSpeed = 40) => {
  // averageSpeed in km/h, default is 40 km/h for bus
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = Math.round(timeInHours * 60);
  
  if (timeInMinutes < 1) {
    return 'Arriving now';
  }
  
  if (timeInMinutes === 1) {
    return '1 minute';
  }
  
  if (timeInMinutes < 60) {
    return `${timeInMinutes} minutes`;
  }
  
  const hours = Math.floor(timeInMinutes / 60);
  const minutes = timeInMinutes % 60;
  
  if (minutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${minutes}m`;
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

export const watchLocation = (callback) => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser');
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date()
      });
    },
    (error) => {
      console.error('Location watch error:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000
    }
  );

  return watchId;
};

export const stopWatchingLocation = (watchId) => {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// Predefined bus stops with coordinates (example locations in Kochi)
export const BUS_STOPS = {
  'Kochi Bus Stop': { lat: 9.9312, lng: 76.2673, name: 'Kochi Bus Stop' },
  'Ernakulam Junction': { lat: 9.9816, lng: 76.2999, name: 'Ernakulam Junction' },
  'Kakkanad': { lat: 10.0261, lng: 76.3473, name: 'Kakkanad' },
  'Aluva': { lat: 10.1081, lng: 76.3529, name: 'Aluva' },
  'Fort Kochi': { lat: 9.9654, lng: 76.2367, name: 'Fort Kochi' },
  'Vyttila Junction': { lat: 9.9589, lng: 76.3022, name: 'Vyttila Junction' },
  'Edappally': { lat: 10.0185, lng: 76.3078, name: 'Edappally' },
  'University Gate': { lat: 10.0436, lng: 76.3294, name: 'University Gate' },
  'Central Station': { lat: 9.9816, lng: 76.2999, name: 'Central Station' },
  'Main Street Stop': { lat: 9.9330, lng: 76.2670, name: 'Main Street Stop' }
};

export const getClosestBusStop = (userLat, userLng) => {
  let closestStop = null;
  let minDistance = Infinity;

  Object.values(BUS_STOPS).forEach(stop => {
    const distance = calculateDistance(userLat, userLng, stop.lat, stop.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestStop = { ...stop, distance };
    }
  });

  return closestStop;
};

// Function to get coordinates by bus stop name
export const getBusStopCoordinates = (stopName) => {
  return BUS_STOPS[stopName] || null;
};

// Generate path points for route visualization (simplified)
export const generateRoutePath = (start, end) => {
  const points = [];
  const steps = 10;
  
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const lat = start.lat + (end.lat - start.lat) * ratio;
    const lng = start.lng + (end.lng - start.lng) * ratio;
    points.push([lat, lng]);
  }
  
  return points;
};

// Speed and movement simulation for demo purposes
export const simulateMovement = (startLat, startLng, endLat, endLng, steps = 20) => {
  const positions = [];
  
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const lat = startLat + (endLat - startLat) * ratio;
    const lng = startLng + (endLng - startLng) * ratio;
    positions.push({
      latitude: lat,
      longitude: lng,
      timestamp: new Date(Date.now() + i * 20000) // 20 seconds interval
    });
  }
  
  return positions;
};