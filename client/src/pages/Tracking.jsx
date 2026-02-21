import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LiveMap from '../components/LiveMap';
import socketService from '../services/socketService';
import { 
  calculateDistance, 
  formatDistance, 
  calculateETA, 
  getCurrentLocation,
  watchLocation,
  stopWatchingLocation,
  getBusStopCoordinates,
  generateRoutePath
} from '../utils/locationUtils';
import '../index.css';

const Tracking = () => {
  const [timeRemaining, setTimeRemaining] = useState({
    minutes: 15,
    seconds: 30
  });
  const [userLocation, setUserLocation] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [deliveryPartnerLocation, setDeliveryPartnerLocation] = useState(null);
  const [journeyStatus, setJourneyStatus] = useState('confirmed');
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [distance, setDistance] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [liveETA, setLiveETA] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [assignedPartner, setAssignedPartner] = useState(null);
  const [orderStatus, setOrderStatus] = useState('confirmed');

  // Mock user data - in real app, this would come from authentication/route params
  const orderId = '1234567890';
  const userId = 'user_456';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize location tracking and socket connection
  useEffect(() => {
    // Connect to socket service
    socketService.connect();
    
    // Join tracking room
    socketService.joinTrackingRoom(orderId, 'user', {
      userId,
      orderId
    });

    // Request location permission and start tracking
    initializeLocationTracking();

    // Socket event listeners
    socketService.onLocationUpdate(handleLocationUpdate);
    socketService.onDeliveryStatusUpdate(handleDeliveryStatusUpdate);
    socketService.onAlert(handleAlert);
    socketService.onPartnerStatusUpdate(handlePartnerStatusUpdate);
    socketService.onOrderStatusUpdate(handleOrderStatusUpdate);

    return () => {
      // Cleanup
      if (watchId) {
        stopWatchingLocation(watchId);
      }
      socketService.leaveTrackingRoom(orderId);
      socketService.removeAllListeners();
    };
  }, []);

  const initializeLocationTracking = async () => {
    try {
      // Get initial location
      const location = await getCurrentLocation();
      setUserLocation(location);
      setIsLocationEnabled(true);
      setLocationError(null);

      // Send initial location
      socketService.updateLocation(orderId, {
        ...location,
        type: 'user'
      });

      // Start watching location
      const id = watchLocation((newLocation) => {
        setUserLocation(newLocation);
        socketService.updateLocation(orderId, {
          ...newLocation,
          type: 'user'
        });

        // Update journey status based on movement
        updateJourneyStatusByLocation(newLocation);
      });
      setWatchId(id);

    } catch (error) {
      console.error('Location access denied:', error);
      setLocationError('Location access is required for live tracking. Please enable location services.');
      setIsLocationEnabled(false);
    }
  };

  const handleLocationUpdate = (data) => {
    const { location, userType } = data;
    
    if (userType === 'delivery_partner') {
      setDeliveryPartnerLocation(location);
    } else if (userType === 'bus') {
      setBusLocation(location);
    }
  };

  const handleDeliveryStatusUpdate = (data) => {
    const { status, location } = data;
    if (location) {
      setDeliveryPartnerLocation(location);
    }
    
    addNotification({
      type: 'delivery_update',
      message: `Delivery partner ${status}`,
      timestamp: new Date()
    });
  };

  const handleAlert = (data) => {
    addNotification({
      type: 'alert',
      message: data.message,
      timestamp: new Date()
    });
  };

  const handlePartnerStatusUpdate = (data) => {
    if (data.orderId === orderId) {
      setAssignedPartner(data.partner);
      addNotification({
        type: 'info',
        message: `Delivery partner ${data.partner.name} has been assigned to your order`,
        timestamp: new Date()
      });
    }
  };

  const handleOrderStatusUpdate = (data) => {
    if (data.orderId === orderId) {
      setOrderStatus(data.status);
      
      let statusMessage = '';
      switch (data.status) {
        case 'confirmed':
          statusMessage = 'Your order has been confirmed';
          break;
        case 'packed':
          statusMessage = 'Your order has been packed and ready for pickup';
          break;
        case 'partner_at_stop':
          statusMessage = 'Delivery partner is waiting at the bus stop';
          break;
        case 'handover':
          statusMessage = 'Order delivered successfully!';
          break;
        default:
          statusMessage = `Order status updated to ${data.status}`;
      }
      
      addNotification({
        type: data.status === 'handover' ? 'success' : 'info',
        message: statusMessage,
        timestamp: new Date()
      });
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== notification));
    }, 5000);
  };

  const updateJourneyStatusByLocation = (location) => {
    const busStopCoords = getBusStopCoordinates(orderDetails.deliveryLocation);
    if (!busStopCoords) return;

    const distanceToStop = calculateDistance(
      location.latitude,
      location.longitude,
      busStopCoords.lat,
      busStopCoords.lng
    );

    setDistance(distanceToStop);
    const eta = calculateETA(distanceToStop);
    setLiveETA(eta);

    let newStatus = journeyStatus;
    
    if (distanceToStop < 0.1) { // Within 100m
      newStatus = 'arrived';
    } else if (distanceToStop < 0.5) { // Within 500m
      newStatus = 'approaching_stop';
    } else if (distanceToStop < 5) { // Within 5km
      newStatus = 'in_transit';
    }

    if (newStatus !== journeyStatus) {
      setJourneyStatus(newStatus);
      socketService.updateJourneyStatus(orderId, newStatus, {
        distance: distanceToStop,
        eta,
        location
      });
      
      // Generate route path when in transit
      if (newStatus === 'in_transit' || newStatus === 'approaching_stop') {
        const path = generateRoutePath(
          { lat: location.latitude, lng: location.longitude },
          busStopCoords
        );
        setRoutePath(path);
      }
    }
  };

  const getStatusMessage = () => {
    switch (journeyStatus) {
      case 'confirmed':
        return 'Your order has been confirmed and is being prepared.';
      case 'in_transit':
        return 'You are on the way to the bus stop.';
      case 'approaching_stop':
        return 'You are approaching the bus stop. The delivery partner is waiting.';
      case 'arrived':
        return 'You have arrived at the bus stop. Look for the delivery partner.';
      default:
        return 'Tracking your journey...';
    }
  };

  const getStatusTitle = () => {
    // First check order status (set by delivery partner)
    switch (orderStatus) {
      case 'confirmed':
        return 'Order Confirmed';
      case 'packed':
        return 'Order Packed';
      case 'partner_at_stop':
        return 'Partner Waiting';
      case 'handover':
        return 'Order Delivered';
      default:
        // Fall back to journey status
        return getJourneyStatusTitle();
    }
  };

  const getJourneyStatusTitle = () => {
    switch (journeyStatus) {
      case 'confirmed':
        return 'Order Confirmed';
      case 'in_transit':
        return 'On The Way';
      case 'approaching_stop':
        return 'Approaching Stop';
      case 'arrived':
        return 'Arrived at Stop';
      default:
        return 'Tracking Active';
    }
  };

  const requestLocationPermission = async () => {
    try {
      await initializeLocationTracking();
    } catch (error) {
      setLocationError('Failed to enable location tracking. Please check your browser settings.');
    }
  };

  const callDeliveryPartner = () => {
    if (assignedPartner && assignedPartner.phone) {
      window.open(`tel:${assignedPartner.phone}`);
    }
  };

  const orderDetails = {
    id: '#1234567890',
    items: 2,
    total: 250,
    deliveryLocation: 'Kochi Bus Stop'
  };

  const trackingStages = [
    { name: 'CONFIRMED', active: orderStatus === 'confirmed' || ['packed', 'partner_at_stop', 'handover'].includes(orderStatus) },
    { name: 'PACKED', active: orderStatus === 'packed' || ['partner_at_stop', 'handover'].includes(orderStatus) },
    { name: 'PARTNER AT STOP', active: orderStatus === 'partner_at_stop' || orderStatus === 'handover' },
    { name: 'HANDOVER', active: orderStatus === 'handover' }
  ];

  return (
    <div className="tracking-page-container">
      <div className="tracking-content-wrapper">
        <header className="tracking-header">
          <Link to="/order-history" className="tracking-back-button">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="tracking-page-title">Order Tracking</h1>
          <div className="tracking-header-spacer"></div>
        </header>
        
        <main className="tracking-main-content">
          {/* Location Permission Notice */}
          {!isLocationEnabled && (
            <div className="tracking-location-notice">
              <div className="location-notice-content">
                <span className="material-symbols-outlined">location_off</span>
                <div>
                  <h3>Enable Location Tracking</h3>
                  <p>{locationError || 'Allow location access to track your journey in real-time'}</p>
                </div>
                <button 
                  onClick={requestLocationPermission}
                  className="location-enable-button"
                >
                  Enable
                </button>
              </div>
            </div>
          )}

          {/* Live Notifications */}
          {notifications.length > 0 && (
            <div className="tracking-notifications">
              {notifications.map((notification, index) => (
                <div key={index} className={`tracking-notification ${notification.type}`}>
                  <span className="material-symbols-outlined">
                    {notification.type === 'alert' ? 'warning' : 'info'}
                  </span>
                  <span>{notification.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="tracking-progress-card">
            <div className="tracking-stages-section">
              <div className="tracking-stages-labels">
                {trackingStages.map((stage, index) => (
                  <span key={index} className={stage.active ? 'tracking-stage-active' : 'tracking-stage-inactive'}>
                    {stage.name}
                  </span>
                ))}
              </div>
              <div className="tracking-progress-bar-container">
                <div className="tracking-progress-bar" style={{width: journeyStatus === 'confirmed' ? '25%' : journeyStatus === 'in_transit' ? '50%' : journeyStatus === 'approaching_stop' ? '75%' : '100%'}}></div>
              </div>
            </div>
            
            <div className="tracking-status-section">
              <h2 className="tracking-status-title">{getStatusTitle()}</h2>
              <p className="tracking-status-description">{getStatusMessage()}</p>
              
              {isLocationEnabled && distance && (
                <div className="tracking-live-stats">
                  <div className="tracking-stat">
                    <span className="material-symbols-outlined">near_me</span>
                    <div>
                      <p className="stat-label">Distance to Stop</p>
                      <p className="stat-value">{formatDistance(distance)}</p>
                    </div>
                  </div>
                  {liveETA && (
                    <div className="tracking-stat">
                      <span className="material-symbols-outlined">schedule</span>
                      <div>
                        <p className="stat-label">Live ETA</p>
                        <p className="stat-value">{liveETA}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Partner Information */}
          {assignedPartner && (
            <div className="delivery-partner-info">
              <h3 className="tracking-section-title">Your Delivery Partner</h3>
              <div className="partner-card">
                <div className="partner-header">
                  <div className="partner-avatar">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div className="partner-details">
                    <h3>{assignedPartner.name}</h3>
                    <p>Delivery Partner</p>
                    <p className="partner-vehicle">{assignedPartner.vehicleType || 'Bike'}</p>
                  </div>
                  <div className="partner-status online">
                    <span className="material-symbols-outlined">wifi</span>
                    <span>Online</span>
                  </div>
                </div>
                
                <div className="partner-actions">
                  <button 
                    onClick={callDeliveryPartner}
                    className="partner-call-button"
                  >
                    <span className="material-symbols-outlined">call</span>
                    Call Partner
                  </button>
                  <div className="partner-location">
                    <span className="material-symbols-outlined">location_on</span>
                    <span>Waiting at {orderDetails.deliveryLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Map */}
          {isLocationEnabled && (
            <div className="tracking-map-section">
              <h3 className="tracking-section-title">Live Location</h3>
              <div className="tracking-map-container">
                <LiveMap
                  height="300px"
                  userLocation={userLocation}
                  busLocation={busLocation}
                  busStopLocation={getBusStopCoordinates(orderDetails.deliveryLocation)}
                  deliveryPartnerLocation={deliveryPartnerLocation}
                  routePath={routePath}
                  className="tracking-live-map"
                />
                
                <div className="tracking-map-legend">
                  <h4>Live Tracking Information</h4>
                  <div className="tracking-legend-items">
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#4CAF50'}}></div>
                      <span>Your Location {userLocation && '(Live)'}</span>
                    </div>
                    {busLocation && (
                      <div className="legend-item">
                        <div className="legend-color" style={{backgroundColor: '#2196F3'}}></div>
                        <span>Bus Location</span>
                      </div>
                    )}
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#FF9800'}}></div>
                      <span>Delivery Stop</span>
                    </div>
                    {deliveryPartnerLocation && (
                      <div className="legend-item">
                        <div className="legend-color" style={{backgroundColor: '#9C27B0'}}></div>
                        <span>Delivery Partner</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="tracking-countdown-section">
            <p className="tracking-countdown-label">Your order will arrive at the bus stop in:</p>
            <div className="tracking-timer-container">
              <div className="tracking-timer-item">
                <div className="tracking-timer-box">
                  <p className="tracking-timer-value">{timeRemaining.minutes}</p>
                </div>
                <p className="tracking-timer-text">Minutes</p>
              </div>
              <div className="tracking-timer-item">
                <div className="tracking-timer-box">
                  <p className="tracking-timer-value">{timeRemaining.seconds}</p>
                </div>
                <p className="tracking-timer-text">Seconds</p>
              </div>
            </div>
          </div>
          
          <div className="tracking-details-section">
            <h3 className="tracking-section-title">Order Details</h3>
            <div className="tracking-details-card">
              <div className="tracking-detail-row">
                <p className="tracking-detail-label">Order ID</p>
                <p className="tracking-detail-value">{orderDetails.id}</p>
              </div>
              <div className="tracking-detail-row">
                <p className="tracking-detail-label">Items</p>
                <p className="tracking-detail-value">{orderDetails.items} items</p>
              </div>
              <div className="tracking-detail-row">
                <p className="tracking-detail-label">Total</p>
                <p className="tracking-detail-value">₹ {orderDetails.total}</p>
              </div>
            </div>
          </div>
          
          <div className="tracking-delivery-section">
            <h3 className="tracking-section-title">Delivery</h3>
            <div className="tracking-delivery-card">
              <div className="tracking-detail-row">
                <p className="tracking-detail-label">Delivery Location</p>
                <p className="tracking-detail-value">{orderDetails.deliveryLocation}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <footer className="tracking-footer-nav">
        <div className="tracking-nav-container">
          <Link className="tracking-nav-item" to="/yathrika-home">
            <span className="material-symbols-outlined">home</span>
            <span className="tracking-nav-text">Home</span>
          </Link>
          <Link className="tracking-nav-item tracking-nav-active" to="/order-history">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="tracking-nav-text">Orders</span>
          </Link>
          <Link className="tracking-nav-item" to="/user-profile">
            <span className="material-symbols-outlined">person</span>
            <span className="tracking-nav-text">Profile</span>
          </Link>
          <Link className="tracking-nav-item" to="/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="tracking-nav-text">Notifications</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Tracking;