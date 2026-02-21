import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LiveMap from '../components/LiveMap';
import socketService from '../services/socketService';
import { 
  calculateDistance, 
  formatDistance, 
  calculateETA, 
  getBusStopCoordinates 
} from '../utils/locationUtils';
import '../index.css';

const DeliveryPartnerDashboard = () => {
  const [partner, setPartner] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [userLocations, setUserLocations] = useState({});
  const [isOnline, setIsOnline] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const partnerData = localStorage.getItem('deliveryPartner');
    const token = localStorage.getItem('deliveryPartnerToken');
    
    if (!partnerData || !token) {
      navigate('/delivery-partner-auth');
      return;
    }

    const parsedPartner = JSON.parse(partnerData);
    setPartner(parsedPartner);

    // Connect to socket service
    socketService.connect();

    // Set partner location to assigned bus stop
    const busStopCoords = getBusStopCoordinates(parsedPartner.assignedBusStop);
    if (busStopCoords) {
      setPartnerLocation({
        latitude: busStopCoords.lat,
        longitude: busStopCoords.lng
      });
    }

    // Join partner room for real-time updates
    socketService.joinPartnerRoom(parsedPartner.assignedBusStop, parsedPartner.id);

    // Load available orders
    loadAvailableOrders();
    loadAcceptedOrders();

    // Socket event listeners
    socketService.onOrderUpdate(handleOrderUpdate);
    socketService.onUserLocationUpdate(handleUserLocationUpdate);
    socketService.onOrderStatusUpdate(handleOrderStatusUpdate);

    return () => {
      socketService.removeAllListeners();
    };
  }, [navigate]);

  const loadAvailableOrders = () => {
    // Mock available orders - in real app, fetch from API
    const mockAvailableOrders = [
      {
        id: '1234567890',
        userId: 'user_456',
        userName: 'John Doe',
        userPhone: '+91 9876543210',
        items: [
          { name: 'Snacks Pack', quantity: 1 },
          { name: 'Water Bottle', quantity: 1 }
        ],
        total: 250,
        deliveryLocation: partner?.assignedBusStop || 'Kochi Bus Stop',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 300000), // 5 minutes ago
        busRoute: 'Kakkanad - Ernakulam',
        pickupReward: 50
      },
      {
        id: '0987654321',
        userId: 'user_789',
        userName: 'Jane Smith',
        userPhone: '+91 9876543211',
        items: [
          { name: 'Food Combo', quantity: 1 }
        ],
        total: 180,
        deliveryLocation: partner?.assignedBusStop || 'Kochi Bus Stop',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 120000), // 2 minutes ago
        busRoute: 'Aluva - Fort Kochi',
        pickupReward: 35
      }
    ];

    setAvailableOrders(mockAvailableOrders);
  };

  const loadAcceptedOrders = () => {
    // Mock accepted orders - in real app, fetch from API
    const mockAcceptedOrders = [];
    setAcceptedOrders(mockAcceptedOrders);
  };

  const handleOrderUpdate = (data) => {
    // Handle real-time order updates
    if (data.type === 'new_order') {
      setAvailableOrders(prev => [data.order, ...prev]);
      addNotification({
        type: 'new_order',
        message: `New order available: ₹${data.order.total}`,
        timestamp: new Date()
      });
    } else if (data.type === 'order_accepted') {
      // Remove from available orders if another partner accepted it
      setAvailableOrders(prev => prev.filter(order => order.id !== data.orderId));
    }
  };

  const handleUserLocationUpdate = (data) => {
    const { orderId, location } = data;
    setUserLocations(prev => ({
      ...prev,
      [orderId]: location
    }));
  };

  const handleOrderStatusUpdate = (data) => {
    const { orderId, status } = data;
    
    // Update accepted orders with new status
    setAcceptedOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const acceptOrder = async (order) => {
    try {
      // In real app, make API call to accept order
      const acceptedOrder = {
        ...order,
        acceptedAt: new Date(),
        partnerId: partner.id,
        partnerName: partner.name,
        partnerPhone: partner.phone
      };

      // Move to accepted orders
      setAcceptedOrders(prev => [acceptedOrder, ...prev]);
      setAvailableOrders(prev => prev.filter(o => o.id !== order.id));

      // Notify other partners via socket
      socketService.notifyOrderAccepted(order.id, partner.assignedBusStop);

      // Join tracking room for this order
      socketService.joinTrackingRoom(order.id, 'delivery_partner', {
        partnerId: partner.id,
        partnerName: partner.name,
        busStop: partner.assignedBusStop
      });

      addNotification({
        type: 'success',
        message: `Order ${order.id} accepted successfully`,
        timestamp: new Date()
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to accept order. Please try again.',
        timestamp: new Date()
      });
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Update order status locally
      setAcceptedOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      // Send status update via socket
      socketService.updateOrderStatus(orderId, newStatus, {
        partnerId: partner.id,
        timestamp: new Date()
      });

      addNotification({
        type: 'info',
        message: `Order ${orderId} status updated to ${newStatus.toUpperCase()}`,
        timestamp: new Date()
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to update status. Please try again.',
        timestamp: new Date()
      });
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== notification));
    }, 5000);
  };

  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    // Update partner availability via socket
    socketService.updatePartnerAvailability(partner.id, newStatus);
    
    addNotification({
      type: 'info',
      message: `You are now ${newStatus ? 'online' : 'offline'}`,
      timestamp: new Date()
    });
  };

  const callCustomer = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`);
  };

  const logout = () => {
    localStorage.removeItem('deliveryPartner');
    localStorage.removeItem('deliveryPartnerToken');
    socketService.disconnect();
    navigate('/delivery-partner-auth');
  };

  if (!partner) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading partner dashboard...</p>
      </div>
    );
  }

  const statusButtons = [
    { status: 'confirmed', label: 'CONFIRMED', color: '#2196F3' },
    { status: 'packed', label: 'PACKED', color: '#FF9800' },
    { status: 'partner_at_stop', label: 'PARTNER AT STOP', color: '#9C27B0' },
    { status: 'handover', label: 'HANDOVER', color: '#4CAF50' }
  ];

  return (
    <div className="partner-dashboard-container">
      <div className="partner-dashboard-wrapper">
        <header className="partner-dashboard-header">
          <div className="partner-header-content">
            <Link to="/delivery-partner-auth" className="partner-back-button">
              <i className="material-icons">arrow_back</i>
            </Link>
            <div className="partner-info">
              <h1 className="partner-title">Welcome, {partner.name}</h1>
              <p className="partner-location">{partner.assignedBusStop}</p>
            </div>
            <div className="partner-header-actions">
              <button
                onClick={toggleOnlineStatus}
                className={`partner-status-toggle ${isOnline ? 'online' : 'offline'}`}
              >
                <i className="material-icons">
                  {isOnline ? 'wifi' : 'wifi_off'}
                </i>
                {isOnline ? 'Online' : 'Offline'}
              </button>
              <button onClick={logout} className="partner-logout-button">
                <i className="material-icons">exit_to_app</i>
              </button>
            </div>
          </div>
        </header>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="partner-notifications">
            {notifications.map((notification, index) => (
              <div key={index} className={`partner-notification ${notification.type}`}>
                <i className="material-icons">
                  {notification.type === 'error' ? 'error' :
                   notification.type === 'success' ? 'check_circle' :
                   notification.type === 'new_order' ? 'shopping_cart' : 'info'}
                </i>
                <span>{notification.message}</span>
              </div>
            ))}
          </div>
        )}

        <main className="partner-dashboard-main">
          {/* Available Orders Section */}
          <section className="partner-section">
            <div className="partner-section-header">
              <h2>Available Orders ({availableOrders.length})</h2>
              <button 
                onClick={loadAvailableOrders}
                className="partner-refresh-button"
              >
                <i className="material-icons">refresh</i>
                Refresh
              </button>
            </div>

            {availableOrders.length === 0 ? (
              <div className="partner-no-orders">
                <i className="material-icons">inbox</i>
                <p>No available orders</p>
                <p>You will be notified when new orders arrive</p>
              </div>
            ) : (
              <div className="partner-orders-grid">
                {availableOrders.map((order) => (
                  <div key={order.id} className="partner-order-card available">
                    <div className="order-header">
                      <div>
                        <h3 className="order-id">#{order.id}</h3>
                        <p className="order-customer">{order.userName}</p>
                        <p className="order-time">
                          {Math.floor((new Date() - order.createdAt) / 60000)} min ago
                        </p>
                      </div>
                      <div className="order-reward">
                        <i className="material-icons">payment</i>
                        <span>₹{order.pickupReward}</span>
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <span key={index} className="order-item">
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                      </div>
                      <div className="order-info">
                        <span>Total: ₹{order.total}</span>
                        <span>Route: {order.busRoute}</span>
                      </div>
                    </div>

                    <div className="order-actions">
                      <button
                        onClick={() => acceptOrder(order)}
                        className="partner-action-button primary"
                        disabled={!isOnline}
                      >
                        <i className="material-icons">add_task</i>
                        Accept Order
                      </button>
                      <button
                        onClick={() => callCustomer(order.userPhone)}
                        className="partner-action-button secondary"
                      >
                        <i className="material-icons">call</i>
                        Call
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Accepted Orders Section */}
          {acceptedOrders.length > 0 && (
            <section className="partner-section">
              <div className="partner-section-header">
                <h2>My Orders ({acceptedOrders.length})</h2>
              </div>

              <div className="partner-orders-grid">
                {acceptedOrders.map((order) => (
                  <div key={order.id} className="partner-order-card accepted">
                    <div className="order-header">
                      <div>
                        <h3 className="order-id">#{order.id}</h3>
                        <p className="order-customer">{order.userName}</p>
                      </div>
                      <div className={`order-status ${order.status}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <span key={index} className="order-item">
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                      </div>
                      <div className="order-info">
                        <span>Total: ₹{order.total}</span>
                        <span>Reward: ₹{order.pickupReward}</span>
                      </div>

                      {userLocations[order.id] && (
                        <div className="order-tracking-info">
                          <i className="material-icons">near_me</i>
                          <span>Customer approaching</span>
                        </div>
                      )}
                    </div>

                    {/* Status Update Buttons */}
                    <div className="order-status-buttons">
                      {statusButtons.map(({ status, label, color }) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          className={`status-button ${order.status === status ? 'active' : ''}`}
                          style={{ 
                            borderColor: color,
                            backgroundColor: order.status === status ? color : 'transparent',
                            color: order.status === status ? 'white' : color
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="order-actions">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="partner-action-button primary"
                      >
                        <i className="material-icons">map</i>
                        Track Customer
                      </button>
                      <button
                        onClick={() => callCustomer(order.userPhone)}
                        className="partner-action-button secondary"
                      >
                        <i className="material-icons">call</i>
                        Call Customer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Live Tracking Map */}
          {selectedOrder && (
            <section className="partner-section">
              <div className="partner-section-header">
                <h3>Tracking Order #{selectedOrder.id}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="partner-close-button"
                >
                  <i className="material-icons">close</i>
                </button>
              </div>
              
              <LiveMap
                height="400px"
                userLocation={userLocations[selectedOrder.id]}
                busStopLocation={getBusStopCoordinates(partner.assignedBusStop)}
                deliveryPartnerLocation={partnerLocation}
                className="partner-tracking-map"
              />
              
              {userLocations[selectedOrder.id] && (
                <div className="partner-map-info">
                  <div className="partner-map-stats">
                    <div className="partner-stat">
                      <i className="material-icons">person</i>
                      <div>
                        <p>{selectedOrder.userName}</p>
                        <p>Last seen: {new Date(userLocations[selectedOrder.id].timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="partner-stat">
                      <i className="material-icons">local_shipping</i>
                      <div>
                        <p>Status</p>
                        <p>{selectedOrder.status.replace('_', ' ').toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default DeliveryPartnerDashboard;