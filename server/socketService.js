// services/socketService.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket?.connected) return;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    this.socket.on('connect',    () => console.log('🔌 Socket connected:', this.socket.id));
    this.socket.on('disconnect', () => console.log('🔌 Socket disconnected'));
    this.socket.on('connect_error', (err) => console.warn('⚠️ Socket error:', err.message));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event, data) {
    this.socket?.emit(event, data);
  }

  // ── Partner auth ────────────────────────────────────────────────────────────

  /** Partner pending screen: watch for admin approval in real-time */
  watchApproval(partnerId) {
    this.socket?.emit('watch_approval', { partnerId });
  }

  /** Called when admin approves or rejects */
  onApprovalStatusChanged(cb) {
    this.socket?.on('approval_status_changed', cb);
  }

  // ── Partner dashboard ───────────────────────────────────────────────────────

  /** Join the bus-stop room to receive new order notifications */
  joinPartnerRoom(busStop, partnerId) {
    this.socket?.emit('join_partner_room', { busStop, partnerId });
  }

  /** Receive new orders or order-accepted notifications */
  onOrderUpdate(cb) {
    this.socket?.on('order_update', cb);
  }

  /** Tell everyone at the stop that this order was accepted */
  notifyOrderAccepted(orderId, busStop) {
    this.socket?.emit('order_accepted', { orderId, busStop });
  }

  /** Join the per-order tracking room */
  joinTrackingRoom(orderId, userType, userData) {
    this.socket?.emit('join_tracking', { orderId, userType, userData });
  }

  leaveTrackingRoom(orderId) {
    this.socket?.emit('leave_tracking', { orderId });
  }

  /** Send order status update (CONFIRMED → PACKED → PARTNER AT STOP → HANDOVER) */
  updateOrderStatus(orderId, status, extra = {}) {
    this.socket?.emit('order_status_update', { orderId, status, ...extra });
  }

  /** Receive order status changes (used by user tracking page) */
  onOrderStatusUpdate(cb) {
    this.socket?.on('order_status_updated', cb);
  }

  /** Partner assigned notification received by user tracking page */
  onPartnerStatusUpdate(cb) {
    this.socket?.on('partner_status_update', cb);
  }

  updatePartnerAvailability(partnerId, isAvailable) {
    this.socket?.emit('partner_availability_update', { partnerId, isAvailable });
  }

  // ── Location ────────────────────────────────────────────────────────────────

  updateLocation(orderId, location) {
    this.socket?.emit('location_update', { orderId, location });
  }

  updateJourneyStatus(orderId, status, extra = {}) {
    this.socket?.emit('journey_status_update', { orderId, status, ...extra });
  }

  onLocationUpdate(cb) {
    this.socket?.on('location_updated', cb);
  }

  onDeliveryStatusUpdate(cb) {
    this.socket?.on('delivery_status_updated', cb);
  }

  onAlert(cb) {
    this.socket?.on('tracking_alert_received', cb);
  }

  onUserLocationUpdate(cb) {
    // Partners listen for customer location updates
    this.socket?.on('location_updated', (data) => {
      if (data.userType === 'user') cb({ orderId: data.orderId, location: data.location });
    });
  }

  removeAllListeners() {
    if (!this.socket) return;
    [
      'approval_status_changed', 'order_update', 'order_status_updated',
      'partner_status_update', 'location_updated', 'delivery_status_updated',
      'tracking_alert_received', 'journey_status_updated', 'user_joined',
    ].forEach(ev => this.socket.off(ev));
  }
}

const socketService = new SocketService();
export default socketService;