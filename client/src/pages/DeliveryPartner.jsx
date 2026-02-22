import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LiveMap from '../components/LiveMap';
import { useLanguage } from '../LanguageContext';
import socketService from '../services/socketService';
import { 
  calculateDistance, 
  formatDistance, 
  calculateETA, 
  getBusStopCoordinates,
  getCurrentLocation 
} from '../utils/locationUtils';
import '../index.css';

const DeliveryPartner = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [userLocations, setUserLocations] = useState({});
  const [isOnline, setIsOnline] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Mock partner data - in real app, this would come from authentication
  const partnerId = 'partner_123';
  const assignedBusStop = 'Kochi Bus Stop';

  useEffect(() => {
    // Connect to socket service
    socketService.connect();

    // Set partner location to bus stop coordinates
    const busStopCoords = getBusStopCoordinates(assignedBusStop);
    if (busStopCoords) {
      setPartnerLocation({
        latitude: busStopCoords.lat,
        longitude: busStopCoords.lng
      });
    }

    // Load active orders for this bus stop
    loadActiveOrders();

    // Socket event listeners
    socketService.onLocationUpdate(handleUserLocationUpdate);
    socketService.onJourneyStatusUpdate(handleJourneyStatusUpdate);
    socketService.onAlert(handleAlert);

    return () => {
      // Cleanup
      socketService.removeAllListeners();
      if (isOnline) {
        updatePartnerStatus('offline');
      }
    };
  }, []);

  const loadActiveOrders = () => {
    // Mock active orders - in real app, fetch from API
    const mockOrders = [
      {
        id: '1234567890',
        userId: 'user_456',
        userName: 'John Doe',
        userPhone: '+91 9876543210',
        items: 2,
        total: 250,
        deliveryLocation: assignedBusStop,
        status: 'in_transit',
        estimatedArrival: '15 min',
        busRoute: 'Kakkanad - Ernakulam'
      },
      {
        id: '0987654321',
        userId: 'user_789',
        userName: 'Jane Smith',
        userPhone: '+91 9876543211',
        items: 1,
        total: 180,
        deliveryLocation: assignedBusStop,
        status: 'boarding',
        estimatedArrival: '25 min',
        busRoute: 'Aluva - Fort Kochi'
      }
    ];

    setActiveOrders(mockOrders);
    
    // Join tracking rooms for all active orders
    mockOrders.forEach(order => {
      socketService.joinTrackingRoom(order.id, 'delivery_partner', {
        partnerId,
        busStop: assignedBusStop,
        location: partnerLocation
      });
    });
  };

  const handleUserLocationUpdate = (data) => {
    const { orderId, location, userType } = data;
    
    if (userType === 'user') {
      setUserLocations(prev => ({
        ...prev,
        [orderId]: location
      }));

      // Calculate distance and ETA
      if (partnerLocation) {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          partnerLocation.latitude,
          partnerLocation.longitude
        );

        const eta = calculateETA(distance);

        // Update order info
        setActiveOrders(prev => prev.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              distance: formatDistance(distance),
              estimatedArrival: eta,
              lastLocationUpdate: new Date()
            };
          }
          return order;
        }));

        // Send notification if user is very close
        if (distance < 0.5 && !notifications.find(n => n.orderId === orderId && n.type === 'approaching')) {
          addNotification({
            orderId,
            type: 'approaching',
            message: `Customer for order #${orderId} is approaching (${formatDistance(distance)} away)`,
            timestamp: new Date()
          });
        }
      }
    }
  };

  const handleJourneyStatusUpdate = (data) => {
    const { orderId, status } = data;
    
    setActiveOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, status };
      }
      return order;
    }));

    // Add notification for status changes
    const statusMessages = {
      'boarding': 'Customer has boarded the bus',
      'in_transit': 'Customer is on the way',
      'approaching_stop': 'Customer is approaching the bus stop',
      'arrived': 'Customer has arrived at the bus stop'
    };

    if (statusMessages[status]) {
      addNotification({
        orderId,
        type: 'status_update',
        message: `Order #${orderId}: ${statusMessages[status]}`,
        timestamp: new Date()
      });
    }
  };

  const handleAlert = (data) => {
    addNotification({
      ...data,
      type: 'alert',
      timestamp: new Date()
    });
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10 notifications
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== notification));
    }, 5000);
  };

  const updatePartnerStatus = (status) => {
    activeOrders.forEach(order => {
      socketService.updateDeliveryStatus(order.id, status, partnerLocation);
    });
    setIsOnline(status === 'online');
  };

  const markOrderAsDelivered = (orderId) => {
    socketService.updateDeliveryStatus(orderId, 'delivered', partnerLocation);
    setActiveOrders(prev => prev.filter(order => order.id !== orderId));
    socketService.leaveTrackingRoom(orderId);
    
    addNotification({
      orderId,
      type: 'delivered',
      message: `Order #${orderId} marked as delivered`,
      timestamp: new Date()
    });
  };

  const callCustomer = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`);
  };

  const sendLocationToCustomer = (orderId) => {
    if (partnerLocation) {
      socketService.updateLocation(orderId, {
        ...partnerLocation,
        type: 'delivery_partner',
        message: 'I am waiting at the bus stop'
      });
      
      addNotification({
        orderId,
        type: 'location_sent',
        message: `Location shared with customer for order #${orderId}`,
        timestamp: new Date()
      });
    }
  };

  return (
    <div className="delivery-partner-container">
      <div className="delivery-partner-wrapper">
        {/* Header */}
        <header className="delivery-partner-header">
          <div className="delivery-partner-header-content">
            <Link to="/admin" className="delivery-partner-back-button">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="delivery-partner-title">Delivery Partner</h1>
            <button
              onClick={() => updatePartnerStatus(isOnline ? 'offline' : 'online')}
              className={`delivery-partner-status-toggle ${isOnline ? 'online' : 'offline'}`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
          
          {/* Bus Stop Info */}
          <div className="delivery-partner-location-info">
            <span className="material-symbols-outlined">location_on</span>
            <span>{assignedBusStop}</span>
          </div>
        </header>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="delivery-partner-notifications">
            {notifications.map((notification, index) => (
              <div key={index} className={`delivery-notification ${notification.type}`}>
                <span className="material-symbols-outlined">
                  {notification.type === 'alert' ? 'warning' : 
                   notification.type === 'approaching' ? 'directions_walk' :
                   notification.type === 'delivered' ? 'check_circle' : 'info'}
                </span>
                <span>{notification.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Active Orders */}
        <main className="delivery-partner-main">
          <div className="delivery-partner-orders-section">
            <h2 className="delivery-partner-section-title">Active Orders ({activeOrders.length})</h2>
            
            {activeOrders.length === 0 ? (
              <div className="delivery-partner-no-orders">
                <span className="material-symbols-outlined">inbox</span>
                <p>No active orders</p>
                <p>You will be notified when new orders arrive</p>
              </div>
            ) : (
              <div className="delivery-partner-orders-grid">
                {activeOrders.map((order) => (
                  <div key={order.id} className="delivery-partner-order-card">
                    <div className="delivery-order-header">
                      <div>
                        <h3 className="delivery-order-id">#{order.id}</h3>
                        <p className="delivery-order-customer">{order.userName}</p>
                      </div>
                      <div className={`delivery-order-status ${order.status}`}>
                        {order.status.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="delivery-order-details">
                      <div className="delivery-order-info">
                        <span>Items: {order.items}</span>
                        <span>Total: ₹{order.total}</span>
                        <span>Route: {order.busRoute}</span>
                      </div>
                      
                      {order.distance && (
                        <div className="delivery-order-tracking">
                          <div className="delivery-distance">
                            <span className="material-symbols-outlined">near_me</span>
                            <span>{order.distance} away</span>
                          </div>
                          <div className="delivery-eta">
                            <span className="material-symbols-outlined">schedule</span>
                            <span>ETA: {order.estimatedArrival}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="delivery-order-actions">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="delivery-action-button primary"
                      >
                        <span className="material-symbols-outlined">map</span>
                        Track
                      </button>
                      <button
                        onClick={() => callCustomer(order.userPhone)}
                        className="delivery-action-button secondary"
                      >
                        <span className="material-symbols-outlined">call</span>
                        Call
                      </button>
                      <button
                        onClick={() => sendLocationToCustomer(order.id)}
                        className="delivery-action-button secondary"
                      >
                        <span className="material-symbols-outlined">share_location</span>
                        Share Location
                      </button>
                      <button
                        onClick={() => markOrderAsDelivered(order.id)}
                        className="delivery-action-button success"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                        Delivered
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map Section */}
          {selectedOrder && (
            <div className="delivery-partner-map-section">
              <div className="delivery-map-header">
                <h3>Tracking Order #{selectedOrder.id}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="delivery-map-close"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <LiveMap
                height="400px"
                userLocation={userLocations[selectedOrder.id]}
                busStopLocation={getBusStopCoordinates(assignedBusStop)}
                deliveryPartnerLocation={partnerLocation}
                className="delivery-tracking-map"
              />
              
              {userLocations[selectedOrder.id] && (
                <div className="delivery-map-info">
                  <div className="delivery-map-stats">
                    <div className="delivery-stat">
                      <span className="material-symbols-outlined">person</span>
                      <div>
                        <p>Customer Location</p>
                        <p>Last updated: {new Date(userLocations[selectedOrder.id].timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="delivery-stat">
                      <span className="material-symbols-outlined">distance</span>
                      <div>
                        <p>Distance</p>
                        <p>{selectedOrder.distance || 'Calculating...'}</p>
                      </div>
                    </div>
                    <div className="delivery-stat">
                      <span className="material-symbols-outlined">schedule</span>
                      <div>
                        <p>ETA</p>
                        <p>{selectedOrder.estimatedArrival || 'Calculating...'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DeliveryPartner;