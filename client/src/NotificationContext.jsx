import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

// Notification types and their config
const TYPE_CONFIG = {
  success: {
    icon: 'check_circle',
    color: '#68f91a',
    bg: '#1a2e0f',
    border: '#68f91a',
  },
  error: {
    icon: 'cancel',
    color: '#ff4d4d',
    bg: '#2e0f0f',
    border: '#ff4d4d',
  },
  info: {
    icon: 'info',
    color: '#4da6ff',
    bg: '#0f1e2e',
    border: '#4da6ff',
  },
  warning: {
    icon: 'warning',
    color: '#ffb84d',
    bg: '#2e1e0f',
    border: '#ffb84d',
  },
};

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  // Full notification history for the Notifications page
  const [history, setHistory] = useState([]);

  const showNotification = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    const notification = { id, type, title, message, timestamp: new Date() };

    setToasts(prev => [notification, ...prev].slice(0, 5));
    setHistory(prev => [notification, ...prev]);

    setTimeout(() => {
      setToasts(prev => prev.filter(n => n.id !== id));
    }, duration);

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setHistory(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = history.filter(n => !n.read).length;

  // Convenience methods for common events
  const notify = {
    paymentSuccess: (amount) =>
      showNotification({
        type: 'success',
        title: '💰 Payment Successful!',
        message: `₹${amount} paid successfully. Your order is confirmed.`,
      }),

    paymentFailed: (reason) =>
      showNotification({
        type: 'error',
        title: '❌ Payment Failed',
        message: reason || 'Your payment could not be processed. Please try again.',
        duration: 6000,
      }),

    orderConfirmed: (orderId) =>
      showNotification({
        type: 'success',
        title: '✅ Order Confirmed',
        message: `Order #${orderId || '---'} has been confirmed and is being prepared.`,
      }),

    partnerAssigned: (partnerName) =>
      showNotification({
        type: 'info',
        title: '🛵 Delivery Partner Assigned',
        message: `${partnerName || 'A delivery partner'} has been assigned to your order.`,
      }),

    outForDelivery: (stop) =>
      showNotification({
        type: 'info',
        title: '📦 Out for Delivery',
        message: `Your order is on the way to ${stop || 'your bus stop'}!`,
      }),

    delivered: () =>
      showNotification({
        type: 'success',
        title: '🎉 Order Delivered!',
        message: 'Your order has been delivered at the bus stop. Enjoy!',
        duration: 6000,
      }),

    custom: (type, title, message) =>
      showNotification({ type, title, message }),
  };

  return (
    <NotificationContext.Provider value={{ notify, showNotification, history, markAllRead, unreadCount }}>
      {children}

      {/* Toast Container — renders on top of everything */}
      <div style={styles.toastContainer}>
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            toast={toast}
            index={index}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Individual Toast Component
const Toast = ({ toast, index, onDismiss }) => {
  const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
  const [exiting, setExiting] = React.useState(false);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      style={{
        ...styles.toast,
        borderLeft: `4px solid ${config.border}`,
        backgroundColor: config.bg,
        transform: exiting ? 'translateX(120%)' : 'translateX(0)',
        opacity: exiting ? 0 : 1,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        marginTop: index > 0 ? '8px' : '0',
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ color: config.color, fontSize: '22px', flexShrink: 0 }}
      >
        {config.icon}
      </span>

      <div style={styles.toastBody}>
        <p style={{ ...styles.toastTitle, color: config.color }}>{toast.title}</p>
        <p style={styles.toastMessage}>{toast.message}</p>
      </div>

      <button onClick={handleDismiss} style={styles.dismissBtn}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#888' }}>
          close
        </span>
      </button>
    </div>
  );
};

const styles = {
  toastContainer: {
    position: 'fixed',
    top: '20px',
    right: '16px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '360px',
    width: 'calc(100vw - 32px)',
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    pointerEvents: 'all',
    animation: 'slideIn 0.3s ease',
  },
  toastBody: {
    flex: 1,
    minWidth: 0,
  },
  toastTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    lineHeight: '1.3',
  },
  toastMessage: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#ccc',
    lineHeight: '1.4',
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
};