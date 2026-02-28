import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import '../index.css';

// Kerala bus stops database — real stops, used as fallback + distance reference
const KERALA_BUS_STOPS = [
  { id: 1,  name: 'Kollam Bus Stand',         lat: 8.8932,  lng: 76.6141, city: 'Kollam'      },
  { id: 2,  name: 'Kadavoor Junction',         lat: 8.9301,  lng: 76.6423, city: 'Kollam'      },
  { id: 3,  name: 'Paravur Bus Stop',          lat: 8.7876,  lng: 76.6803, city: 'Kollam'      },
  { id: 4,  name: 'Karunagappally Stop',       lat: 9.0612,  lng: 76.5349, city: 'Kollam'      },
  { id: 5,  name: 'Ernakulam KSRTC',           lat: 9.9816,  lng: 76.2999, city: 'Ernakulam'   },
  { id: 6,  name: 'Aluva Bus Stand',           lat: 10.1004, lng: 76.3570, city: 'Ernakulam'   },
  { id: 7,  name: 'Vyttila Mobility Hub',      lat: 9.9602,  lng: 76.3201, city: 'Ernakulam'   },
  { id: 8,  name: 'Kakkanad Junction',         lat: 10.0161, lng: 76.3508, city: 'Ernakulam'   },
  { id: 9,  name: 'Thrissur Round',            lat: 10.5276, lng: 76.2144, city: 'Thrissur'    },
  { id: 10, name: 'Palakkad Bus Stand',        lat: 10.7867, lng: 76.6548, city: 'Palakkad'    },
  { id: 11, name: 'Kozhikode KSRTC',           lat: 11.2588, lng: 75.7804, city: 'Kozhikode'   },
  { id: 12, name: 'Thiruvananthapuram Central',lat: 8.4855,  lng: 76.9492, city: 'Trivandrum'  },
  { id: 13, name: 'Attingal Bus Stop',         lat: 8.6951,  lng: 76.8149, city: 'Trivandrum'  },
  { id: 14, name: 'Kottayam Bus Stand',        lat: 9.5916,  lng: 76.5222, city: 'Kottayam'    },
  { id: 15, name: 'Alappuzha Bus Stand',       lat: 9.4981,  lng: 76.3388, city: 'Alappuzha'   },
  { id: 16, name: 'Kannur Bus Stand',          lat: 11.8745, lng: 75.3704, city: 'Kannur'      },
  { id: 17, name: 'Kasaragod Bus Stand',       lat: 12.4996, lng: 74.9869, city: 'Kasaragod'   },
  { id: 18, name: 'Manjeri Bus Stand',         lat: 11.1201, lng: 76.1194, city: 'Malappuram'  },
  { id: 19, name: 'Tirur Bus Stop',            lat: 10.9121, lng: 75.9228, city: 'Malappuram'  },
  { id: 20, name: 'Pathanamthitta Bus Stand',  lat: 9.2648,  lng: 76.7870, city: 'Pathanamthitta'},
];

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDist = (km) =>
  km < 1 ? `${Math.round(km * 1000)}m away` : `${km.toFixed(1)}km away`;

const PHASES = { PERMISSION: 'permission', LOCATING: 'locating', SELECT: 'select', CONFIRMING: 'confirming' };

const Routes = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [phase, setPhase]           = useState(PHASES.PERMISSION);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyStops, setNearbyStops]   = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const [allStops, setAllStops]         = useState(KERALA_BUS_STOPS);

  const requestLocation = () => {
    setPhase(PHASES.LOCATING);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported on this device.');
      setPhase(PHASES.SELECT);
      setNearbyStops(KERALA_BUS_STOPS.slice(0, 8));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });

        // Sort all stops by distance from user
        const withDist = KERALA_BUS_STOPS.map((stop) => ({
          ...stop,
          distance: getDistance(lat, lng, stop.lat, stop.lng),
        })).sort((a, b) => a.distance - b.distance);

        setAllStops(withDist);
        setNearbyStops(withDist.slice(0, 6));
        setPhase(PHASES.SELECT);
      },
      (err) => {
        console.error(err);
        setLocationError('Could not get your location. Showing all stops instead.');
        setNearbyStops(KERALA_BUS_STOPS.slice(0, 8));
        setAllStops(KERALA_BUS_STOPS);
        setPhase(PHASES.SELECT);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const skipLocation = () => {
    setNearbyStops(KERALA_BUS_STOPS.slice(0, 8));
    setAllStops(KERALA_BUS_STOPS);
    setPhase(PHASES.SELECT);
  };

  const handleSelectStop = (stop) => {
    setSelectedStop(stop);
    setPhase(PHASES.CONFIRMING);
  };

  const handleConfirm = () => {
    // Save to localStorage for use across the app
    localStorage.setItem('yathrika_bus_stop', JSON.stringify(selectedStop));
    navigate('/yathrika-home');
  };

  const handleChangeStop = () => {
    setPhase(PHASES.SELECT);
    setSelectedStop(null);
  };

  const filteredStops = searchQuery.trim()
    ? allStops.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nearbyStops;

  // ─── PERMISSION SCREEN ───────────────────────────────────────────────────────
  if (phase === PHASES.PERMISSION) {
    return (
      <div style={S.page}>
        <div style={S.permCard}>
          <div style={S.permIconWrap}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#68f91a' }}>
              location_on
            </span>
          </div>
          <h2 style={S.permTitle}>Find Nearby Bus Stops</h2>
          <p style={S.permSubtitle}>
            Allow Yathrika to access your location so we can show bus stops near you for delivery.
          </p>
          <button style={S.primaryBtn} onClick={requestLocation}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>my_location</span>
            Allow Location Access
          </button>
          <button style={S.ghostBtn} onClick={skipLocation}>
            Choose manually instead
          </button>
        </div>
      </div>
    );
  }

  // ─── LOCATING SCREEN ─────────────────────────────────────────────────────────
  if (phase === PHASES.LOCATING) {
    return (
      <div style={S.page}>
        <div style={S.permCard}>
          <div style={{ ...S.permIconWrap, animation: 'pulse 1.5s infinite' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#68f91a' }}>
              gps_fixed
            </span>
          </div>
          <h2 style={S.permTitle}>Finding your location...</h2>
          <p style={S.permSubtitle}>Looking for bus stops near you</p>
          <div style={S.locatingDots}>
            <span style={{ ...S.dot, animationDelay: '0s' }} />
            <span style={{ ...S.dot, animationDelay: '0.2s' }} />
            <span style={{ ...S.dot, animationDelay: '0.4s' }} />
          </div>
        </div>
        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        `}</style>
      </div>
    );
  }

  // ─── CONFIRMING SCREEN ───────────────────────────────────────────────────────
  if (phase === PHASES.CONFIRMING && selectedStop) {
    return (
      <div style={S.page}>
        <div style={S.permCard}>
          <div style={{ ...S.permIconWrap, backgroundColor: 'rgba(104,249,26,0.15)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#68f91a' }}>
              directions_bus
            </span>
          </div>
          <div style={S.confirmBadge}>YOUR DELIVERY STOP</div>
          <h2 style={{ ...S.permTitle, fontSize: '1.4rem' }}>{selectedStop.name}</h2>
          <p style={{ ...S.permSubtitle, color: '#68f91a', fontWeight: 600 }}>
            {selectedStop.city}
            {selectedStop.distance !== undefined && ` · ${formatDist(selectedStop.distance)}`}
          </p>
          <p style={{ ...S.permSubtitle, marginTop: 4 }}>
            Your orders will be delivered to this bus stop. You can change this later in Settings.
          </p>
          <button style={S.primaryBtn} onClick={handleConfirm}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            Confirm This Stop
          </button>
          <button style={S.ghostBtn} onClick={handleChangeStop}>
            Choose a different stop
          </button>
        </div>
      </div>
    );
  }

  // ─── SELECT SCREEN ───────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <h1 style={S.headerTitle}>Choose Bus Stop</h1>
        <p style={S.headerSub}>
          {userLocation
            ? 'Showing stops nearest to you'
            : locationError
            ? locationError
            : 'Select your preferred delivery stop'}
        </p>
      </header>

      {/* Search */}
      <div style={S.searchWrap}>
        <span className="material-symbols-outlined" style={S.searchIcon}>search</span>
        <input
          style={S.searchInput}
          placeholder="Search stops or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button style={S.clearBtn} onClick={() => setSearchQuery('')}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        )}
      </div>

      {/* Section label */}
      <p style={S.sectionLabel}>
        {searchQuery
          ? `${filteredStops.length} result${filteredStops.length !== 1 ? 's' : ''}`
          : userLocation
          ? '📍 Nearest stops'
          : '🚏 Available stops'}
      </p>

      {/* Stops list */}
      <div style={S.stopsList}>
        {filteredStops.length === 0 ? (
          <div style={S.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#444' }}>
              search_off
            </span>
            <p style={{ color: '#888', marginTop: 8 }}>No stops found for "{searchQuery}"</p>
          </div>
        ) : (
          filteredStops.map((stop) => (
            <button
              key={stop.id}
              style={S.stopCard}
              onClick={() => handleSelectStop(stop)}
            >
              <div style={S.stopIconWrap}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#68f91a' }}>
                  directions_bus
                </span>
              </div>
              <div style={S.stopInfo}>
                <p style={S.stopName}>{stop.name}</p>
                <p style={S.stopMeta}>
                  {stop.city}
                  {stop.distance !== undefined && (
                    <span style={S.distBadge}>{formatDist(stop.distance)}</span>
                  )}
                </p>
              </div>
              <span className="material-symbols-outlined" style={{ color: '#555', fontSize: 20 }}>
                chevron_right
              </span>
            </button>
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#16230f',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Space Grotesk', sans-serif",
    paddingBottom: 32,
  },
  permCard: {
    margin: 'auto',
    marginTop: '10vh',
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(104,249,26,0.15)',
    borderRadius: 20,
    padding: '36px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  permIconWrap: {
    width: 90,
    height: 90,
    borderRadius: '50%',
    backgroundColor: 'rgba(104,249,26,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  permTitle: {
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
    textAlign: 'center',
  },
  permSubtitle: {
    color: '#aaa',
    fontSize: '0.9rem',
    textAlign: 'center',
    lineHeight: 1.5,
    margin: 0,
  },
  primaryBtn: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#68f91a',
    color: '#16230f',
    border: 'none',
    borderRadius: 12,
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  ghostBtn: {
    background: 'none',
    border: 'none',
    color: '#68f91a',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    opacity: 0.7,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  confirmBadge: {
    backgroundColor: 'rgba(104,249,26,0.15)',
    color: '#68f91a',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    padding: '4px 12px',
    borderRadius: 20,
  },
  locatingDots: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#68f91a',
    display: 'inline-block',
    animation: 'bounce 1.2s infinite',
  },
  // Select phase
  header: {
    padding: '24px 20px 12px',
    borderBottom: '1px solid rgba(104,249,26,0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: '1.4rem',
    fontWeight: 700,
    margin: '0 0 4px',
  },
  headerSub: {
    color: '#888',
    fontSize: '0.85rem',
    margin: 0,
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    margin: '16px 20px 0',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(104,249,26,0.2)',
    borderRadius: 12,
    padding: '0 12px',
    gap: 8,
  },
  searchIcon: {
    color: '#555',
    fontSize: 20,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.95rem',
    padding: '12px 0',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#555',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
  },
  sectionLabel: {
    color: '#666',
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    margin: '16px 20px 8px',
  },
  stopsList: {
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  stopCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(104,249,26,0.1)',
    borderRadius: 14,
    padding: '14px 16px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  stopIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(104,249,26,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stopInfo: {
    flex: 1,
    minWidth: 0,
  },
  stopName: {
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 600,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stopMeta: {
    color: '#888',
    fontSize: '0.8rem',
    margin: '2px 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  distBadge: {
    color: '#68f91a',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
};

export default Routes;