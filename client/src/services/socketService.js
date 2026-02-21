// Socket service for real-time location tracking
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(serverUrl = 'http://localhost:3001') {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  // Join a tracking room (order-based)
  joinTrackingRoom(orderId, userType, userData = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_tracking', {
        orderId,
        userType, // 'user' or 'delivery_partner'
        userData
      });
    }
  }

  // Leave a tracking room
  leaveTrackingRoom(orderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_tracking', { orderId });
    }
  }

  // Send location update
  updateLocation(orderId, locationData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('location_update', {
        orderId,
        location: locationData,
        timestamp: new Date()
      });
    }
  }

  // Listen for location updates
  onLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('location_updated', callback);
    }
  }

  // Listen for user status updates
  onUserStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('user_status_update', callback);
    }
  }

  // Send user journey status (boarding bus, in transit, approaching stop)
  updateJourneyStatus(orderId, status, additionalData = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit('journey_status_update', {
        orderId,
        status,
        ...additionalData,
        timestamp: new Date()
      });
    }
  }

  // Listen for journey status updates
  onJourneyStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('journey_status_updated', callback);
    }
  }

  // Send delivery partner status
  updateDeliveryStatus(orderId, status, location = null) {
    if (this.socket && this.isConnected) {
      this.socket.emit('delivery_status_update', {
        orderId,
        status,
        location,
        timestamp: new Date()
      });
    }
  }

  // Listen for delivery status updates
  onDeliveryStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('delivery_status_updated', callback);
    }
  }

  // Send ETA updates
  updateETA(orderId, eta, distance) {
    if (this.socket && this.isConnected) {
      this.socket.emit('eta_update', {
        orderId,
        eta,
        distance,
        timestamp: new Date()
      });
    }
  }

  // Listen for ETA updates
  onETAUpdate(callback) {
    if (this.socket) {
      this.socket.on('eta_updated', callback);
    }
  }

  // Emergency or alert functions
  sendAlert(orderId, alertType, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('tracking_alert', {
        orderId,
        alertType,
        message,
        timestamp: new Date()
      });
    }
  }

  // Listen for alerts
  onAlert(callback) {
    if (this.socket) {
      this.socket.on('tracking_alert_received', callback);
    }
  }

  // Get list of users in tracking room
  getTrackingRoomUsers(orderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_tracking_users', { orderId });
    }
  }

  // Listen for tracking room users list
  onTrackingRoomUsers(callback) {
    if (this.socket) {
      this.socket.on('tracking_users_list', callback);
    }
  }

  // Clean up listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Partner-specific methods
  joinPartnerRoom(busStop, partnerId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_partner_room', {
        busStop,
        partnerId,
        timestamp: new Date()
      });
    }
  }

  // Notify other partners when order is accepted
  notifyOrderAccepted(orderId, busStop) {
    if (this.socket && this.isConnected) {
      this.socket.emit('order_accepted', {
        orderId,
        busStop,
        timestamp: new Date()
      });
    }
  }

  // Update partner availability status
  updatePartnerAvailability(partnerId, isAvailable) {
    if (this.socket && this.isConnected) {
      this.socket.emit('partner_availability_update', {
        partnerId,
        isAvailable,
        timestamp: new Date()
      });
    }
  }

  // Update order status (for delivery partners)
  updateOrderStatus(orderId, status, additionalData = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit('order_status_update', {
        orderId,
        status,
        ...additionalData,
        timestamp: new Date()
      });
    }
  }

  // Listen for order updates (new orders, acceptances, etc.)
  onOrderUpdate(callback) {
    if (this.socket) {
      this.socket.on('order_update', callback);
    }
  }

  // Listen for user location updates (for partners tracking customers)
  onUserLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('user_location_update', callback);
    }
  }

  // Listen for order status updates
  onOrderStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('order_status_updated', callback);
    }
  }

  // Listen for partner status updates
  onPartnerStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('partner_status_update', callback);
    }
  }

  // Check connection status
  isSocketConnected() {
    return this.socket && this.isConnected;
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;