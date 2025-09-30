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
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="flex items-center p-4">
          <Link to="/yathrika-home" className="p-2 text-gray-800 dark:text-gray-200">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="flex-1 text-center text-xl font-bold text-gray-900 dark:text-white pr-10">Select Route</h1>
        </div>
      </header>
      
      <main className="flex-grow p-4 space-y-6">
        <div className="relative">
          <label className="sr-only" htmlFor="route-select">Select a route</label>
          <select 
            className="glow-input w-full appearance-none rounded-lg border-2 border-primary/30 bg-background-light dark:bg-black/20 px-4 py-3 text-lg font-medium text-gray-900 dark:text-white focus:border-primary focus:ring-primary/50" 
            id="route-select"
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2368f91a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            {routes.map((route, index) => (
              <option key={index} value={route}>{route}</option>
            ))}
          </select>
        </div>
        
        <div 
          className="aspect-video w-full rounded-xl bg-cover bg-center shadow-lg shadow-primary/10 glow-shadow" 
          style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAacbt3jIVg0JReJvjlyezhOgy0xC9KQHc1MtkmY4KhlVzWZo8DCFxDMzxg1xqLiXcCXLa8FuylCQtmHt9feyYXjygNRDIc6uuMqaBtW6HaBsLpbp58JzNd7wPM4WGN2tqF8ciZv6ptxSL34sODaDAe_DdHRKLBqrohMoxkXvSbPk0IRfBbu-j4JIqs-lO_WEMZkiUwkC_a9umpg9V6rNYcvoiZRcmu72zauuRXQYhKyuWtG3EML48E7ZFgkTFs3byFsgkQTrm0GhU")'}}
        ></div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Available Stops</h2>
          <div className="space-y-2">
            {stops.map((stop) => (
              <div 
                key={stop.id} 
                className={`flex items-center justify-between rounded-lg p-4 glow-shadow ${
                  preferredStop === stop.name 
                    ? 'bg-primary/10 dark:bg-primary/20 ring-2 ring-primary' 
                    : 'bg-background-light dark:bg-black/20'
                }`}
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {stop.name}
                    {preferredStop === stop.name && (
                      <span className="text-xs font-medium text-primary ml-2">(Preferred)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stop.malayalamTime}</p>
                </div>
                {preferredStop === stop.name ? (
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined">star</span>
                  </div>
                ) : (
                  <button 
                    className="rounded-full bg-primary/20 dark:bg-primary/30 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/30 dark:hover:bg-primary/40 glow-shadow"
                    onClick={() => handleSetPreferred(stop.name)}
                  >
                    Set Preferred
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <footer className="footer-nav">
        <nav className="flex justify-around p-2">
          <Link className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-primary" to="/yathrika-home">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors" to="/order-history">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-xs font-medium">Orders</span>
          </Link>
          <Link className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors" to="/user-profile">
            <span className="material-symbols-outlined">person</span>
            <span className="text-xs font-medium">Profile</span>
          </Link>
          <Link className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors" to="/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="text-xs font-medium">Notifications</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Routes;