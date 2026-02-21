import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LiveMap from '../components/LiveMap';
import { 
  BUS_STOPS, 
  calculateDistance, 
  formatDistance,
  simulateMovement 
} from '../utils/locationUtils';
import '../index.css';

const LiveTrackingDemo = () => {
  const [demoMode, setDemoMode] = useState('user');
  const [userLocation, setUserLocation] = useState(null);
  const [busStopLocation] = useState(BUS_STOPS['Kochi Bus Stop']);
  const [deliveryPartnerLocation] = useState({
    latitude: BUS_STOPS['Kochi Bus Stop'].lat,
    longitude: BUS_STOPS['Kochi Bus Stop'].lng
  });
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (userLocation && busStopLocation) {
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        busStopLocation.lat,
        busStopLocation.lng
      );
      setDistance(dist);
    }
  }, [userLocation, busStopLocation]);

  const startSimulation = () => {
    setSimulationRunning(true);
    
    const startPoint = BUS_STOPS['Kakkanad'];
    const endPoint = BUS_STOPS['Kochi Bus Stop'];
    
    const positions = simulateMovement(
      startPoint.lat,
      startPoint.lng,
      endPoint.lat,
      endPoint.lng,
      20
    );

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < positions.length) {
        setUserLocation(positions[currentStep]);
        currentStep++;
      } else {
        setSimulationRunning(false);
        clearInterval(interval);
      }
    }, 1000);
  };

  const stopSimulation = () => {
    setSimulationRunning(false);
    setUserLocation(null);
  };

  return (
    <div className="demo-container">
      <div className="demo-wrapper">
        <header className="demo-header">
          <Link to="/admin" className="demo-back-button">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="demo-title">Live Tracking Demo</h1>
          <div className="demo-header-spacer"></div>
        </header>

        <main className="demo-main">
          <div className="demo-controls">
            <div className="demo-mode-selector">
              <button
                onClick={() => setDemoMode('user')}
                className={`demo-mode-button ${demoMode === 'user' ? 'active' : ''}`}
              >
                <span className="material-symbols-outlined">person</span>
                User View
              </button>
              <button
                onClick={() => setDemoMode('partner')}
                className={`demo-mode-button ${demoMode === 'partner' ? 'active' : ''}`}
              >
                <span className="material-symbols-outlined">local_shipping</span>
                Partner View
              </button>
            </div>

            <div className="demo-simulation-controls">
              <button
                onClick={startSimulation}
                disabled={simulationRunning}
                className="demo-control-button primary"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                {simulationRunning ? 'Simulating...' : 'Start Simulation'}
              </button>
              <button
                onClick={stopSimulation}
                className="demo-control-button secondary"
              >
                <span className="material-symbols-outlined">stop</span>
                Reset
              </button>
            </div>
          </div>

          <div className="demo-info-panel">
            <h3>How Live Tracking Works</h3>
            <div className="demo-features-list">
              <div className="demo-feature">
                <span className="material-symbols-outlined">location_on</span>
                <div>
                  <h4>Real-time Location</h4>
                  <p>Track user's live location using HTML5 Geolocation API</p>
                </div>
              </div>
              <div className="demo-feature">
                <span className="material-symbols-outlined">map</span>
                <div>
                  <h4>Interactive Map</h4>
                  <p>Free OpenStreetMap-based mapping with Leaflet.js</p>
                </div>
              </div>
              <div className="demo-feature">
                <span className="material-symbols-outlined">wifi</span>
                <div>
                  <h4>Real-time Updates</h4>
                  <p>Socket.IO for instant location and status updates</p>
                </div>
              </div>
              <div className="demo-feature">
                <span className="material-symbols-outlined">calculate</span>
                <div>
                  <h4>Distance & ETA</h4>
                  <p>Live distance calculation and arrival time estimation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="demo-map-section">
            <h3>{demoMode === 'user' ? 'User Tracking View' : 'Delivery Partner View'}</h3>
            <LiveMap
              height="400px"
              userLocation={userLocation}
              busStopLocation={busStopLocation}
              deliveryPartnerLocation={demoMode === 'partner' ? deliveryPartnerLocation : null}
              className="demo-map"
            />
            
            {userLocation && distance && (
              <div className="demo-stats">
                <div className="demo-stat">
                  <span className="material-symbols-outlined">near_me</span>
                  <div>
                    <p>Distance to Bus Stop</p>
                    <p>{formatDistance(distance)}</p>
                  </div>
                </div>
                <div className="demo-stat">
                  <span className="material-symbols-outlined">schedule</span>
                  <div>
                    <p>Status</p>
                    <p>{distance < 0.1 ? 'Arrived' : distance < 0.5 ? 'Approaching' : 'On Route'}</p>
                  </div>
                </div>
                <div className="demo-stat">
                  <span className="material-symbols-outlined">location_on</span>
                  <div>
                    <p>Current Location</p>
                    <p>{userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="demo-quick-links">
            <h3>Try Live Tracking</h3>
            <div className="demo-links-grid">
              <Link to="/tracking" className="demo-quick-link">
                <span className="material-symbols-outlined">my_location</span>
                <div>
                  <h4>User Tracking</h4>
                  <p>Track your journey to bus stop</p>
                </div>
              </Link>
              <Link to="/delivery-partner" className="demo-quick-link">
                <span className="material-symbols-outlined">local_shipping</span>
                <div>
                  <h4>Partner Dashboard</h4>
                  <p>Track approaching customers</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LiveTrackingDemo;