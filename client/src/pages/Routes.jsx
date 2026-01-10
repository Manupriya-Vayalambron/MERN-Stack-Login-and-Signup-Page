import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Routes = () => {
  const [selectedRoute, setSelectedRoute] = useState('Kakkanad - Ernakulam');
  const [preferredStop, setPreferredStop] = useState('University Gate');

  const routes = [
    'Kakkanad - Ernakulam',
    'Aluva - Fort Kochi',
    'Vyttila - Edappally'
  ];

  const stops = [
    {
      id: 1,
      name: 'Main Street Stop',
      malayalamTime: 'ഏകദേശ സമയം: 15 മിനിറ്റ്',
      estimatedTime: 15
    },
    {
      id: 2,
      name: 'University Gate',
      malayalamTime: 'ഏകദേശ സമയം: 25 മിനിറ്റ്',
      estimatedTime: 25
    },
    {
      id: 3,
      name: 'Library Corner',
      malayalamTime: 'ഏകദേശ സമയം: 35 മിനിറ്റ്',
      estimatedTime: 35
    }
  ];

  const handleSetPreferred = (stopName) => {
    setPreferredStop(stopName);
  };

  return (
    <div className="routes-page-container">
      <header className="routes-header">
        <div className="routes-header-content">
          <h1 className="routes-page-title">Select Route</h1>
        </div>
      </header>
      
      <main className="routes-main-content">
        <div className="routes-selector-container">
          <label className="sr-only" htmlFor="route-select">Select a route</label>
          <select 
            className="routes-dropdown" 
            id="route-select"
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
          >
            {routes.map((route, index) => (
              <option key={index} value={route}>{route}</option>
            ))}
          </select>
        </div>
        
        <div 
          className="routes-map-display" 
          style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAacbt3jIVg0JReJvjlyezhOgy0xC9KQHc1MtkmY4KhlVzWZo8DCFxDMzxg1xqLiXcCXLa8FuylCQtmHt9feyYXjygNRDIc6uuMqaBtW6HaBsLpbp58JzNd7wPM4WGN2tqF8ciZv6ptxSL34sODaDAe_DdHRKLBqrohMoxkXvSbPk0IRfBbu-j4JIqs-lO_WEMZkiUwkC_a9umpg9V6rNYcvoiZRcmu72zauuRXQYhKyuWtG3EML48E7ZFgkTFs3byFsgkQTrm0GhU")'}}
        ></div>
        
        <div className="routes-stops-section">
          <h2 className="routes-section-title">Available Stops</h2>
          <div className="routes-stops-list">
            {stops.map((stop) => (
              <div 
                key={stop.id} 
                className={`routes-stop-card ${
                  preferredStop === stop.name 
                    ? 'routes-stop-preferred' 
                    : 'routes-stop-normal'
                }`}
              >
                <div className="routes-stop-info">
                  <p className="routes-stop-name">
                    {stop.name}
                    {preferredStop === stop.name && (
                      <span className="routes-preferred-badge">(Preferred)</span>
                    )}
                  </p>
                  <p className="routes-stop-time">{stop.malayalamTime}</p>
                </div>
                {preferredStop === stop.name ? (
                  <div className="routes-star-indicator">
                    <span className="material-symbols-outlined">star</span>
                  </div>
                ) : (
                  <button 
                    className="routes-set-preferred-button"
                    onClick={() => handleSetPreferred(stop.name)}
                  >
                    Set Preferred
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="routes-confirm-section">
          <Link 
            to="/yathrika-home" 
            className="routes-confirm-button"
          >
            Confirm Route Selection
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Routes;