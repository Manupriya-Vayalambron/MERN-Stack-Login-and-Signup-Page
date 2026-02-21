import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different markers
const createCustomIcon = (color, type) => {
  const icons = {
    user: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" fill="${color}"/>
      <path d="M12 14c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z" fill="${color}"/>
    </svg>`,
    bus: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" fill="${color}"/>
    </svg>`,
    stop: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}"/>
    </svg>`,
    partner: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${color}"/>
    </svg>`
  };

  return L.divIcon({
    html: `<div style="background: white; border-radius: 50%; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${icons[type] || icons.stop}</div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const LiveMap = ({ 
  center = [9.9312, 76.2673], // Default to Kochi
  zoom = 13,
  height = '400px',
  userLocation = null,
  busLocation = null,
  busStopLocation = null,
  deliveryPartnerLocation = null,
  routePath = [],
  onMapClick = null,
  showControls = true,
  className = ''
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routeLayerRef = useRef(null);

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Handle map clicks if callback provided
      if (onMapClick) {
        mapInstanceRef.current.on('click', (e) => {
          onMapClick(e.latlng);
        });
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Add user location marker
    if (userLocation) {
      markersRef.current.user = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: createCustomIcon('#4CAF50', 'user')
      })
      .bindPopup(`
        <div>
          <strong>Your Location</strong><br/>
          Lat: ${userLocation.latitude.toFixed(6)}<br/>
          Lng: ${userLocation.longitude.toFixed(6)}<br/>
          ${userLocation.accuracy ? `Accuracy: ${Math.round(userLocation.accuracy)}m` : ''}
        </div>
      `)
      .addTo(map);
    }

    // Add bus location marker
    if (busLocation) {
      markersRef.current.bus = L.marker([busLocation.latitude, busLocation.longitude], {
        icon: createCustomIcon('#2196F3', 'bus')
      })
      .bindPopup(`
        <div>
          <strong>Bus Location</strong><br/>
          Lat: ${busLocation.latitude.toFixed(6)}<br/>
          Lng: ${busLocation.longitude.toFixed(6)}
        </div>
      `)
      .addTo(map);
    }

    // Add bus stop marker
    if (busStopLocation) {
      markersRef.current.busStop = L.marker([busStopLocation.lat, busStopLocation.lng], {
        icon: createCustomIcon('#FF9800', 'stop')
      })
      .bindPopup(`
        <div>
          <strong>Bus Stop</strong><br/>
          ${busStopLocation.name}<br/>
          Lat: ${busStopLocation.lat.toFixed(6)}<br/>
          Lng: ${busStopLocation.lng.toFixed(6)}
        </div>
      `)
      .addTo(map);
    }

    // Add delivery partner marker
    if (deliveryPartnerLocation) {
      markersRef.current.partner = L.marker([deliveryPartnerLocation.latitude, deliveryPartnerLocation.longitude], {
        icon: createCustomIcon('#9C27B0', 'partner')
      })
      .bindPopup(`
        <div>
          <strong>Delivery Partner</strong><br/>
          Waiting at bus stop<br/>
          Lat: ${deliveryPartnerLocation.latitude.toFixed(6)}<br/>
          Lng: ${deliveryPartnerLocation.longitude.toFixed(6)}
        </div>
      `)
      .addTo(map);
    }

    // Auto-fit map to show all markers
    const markerPositions = Object.values(markersRef.current).map(marker => marker.getLatLng());
    if (markerPositions.length > 0) {
      const group = new L.featureGroup(Object.values(markersRef.current));
      map.fitBounds(group.getBounds().pad(0.1));
    }

  }, [userLocation, busLocation, busStopLocation, deliveryPartnerLocation]);

  // Update route path
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing route
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }

    // Add new route path
    if (routePath && routePath.length > 1) {
      routeLayerRef.current = L.polyline(routePath, {
        color: '#2196F3',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(map);
    }

  }, [routePath]);

  return (
    <div className={`map-container ${className}`}>
      <div 
        ref={mapRef} 
        style={{ 
          height, 
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        className="leaflet-map"
      />
      
      {showControls && (
        <div className="map-legend" style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '8px',
          borderRadius: '6px',
          fontSize: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {userLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#4CAF50', borderRadius: '50%' }}></div>
                <span>You</span>
              </div>
            )}
            {busLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#2196F3', borderRadius: '50%' }}></div>
                <span>Bus</span>
              </div>
            )}
            {busStopLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#FF9800', borderRadius: '50%' }}></div>
                <span>Bus Stop</span>
              </div>
            )}
            {deliveryPartnerLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#9C27B0', borderRadius: '50%' }}></div>
                <span>Delivery Partner</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;