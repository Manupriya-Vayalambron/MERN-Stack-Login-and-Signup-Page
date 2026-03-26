import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useUser } from './UserContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

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

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

const base64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useUser();
  const [toasts, setToasts] = useState([]);
  const [history, setHistory] = useState([]);
  const [browserPermission, setBrowserPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const swRegistrationRef = useRef(null);
  const pushEndpointRef = useRef('');

  const showSystemNotification = useCallback(async ({ type = 'info', title, message, data = {} }) => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const options = {
      body: message,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: data.tag || `${type}_${Date.now()}`,
      data,
    };

    try {
      if (swRegistrationRef.current?.showNotification) {
        await swRegistrationRef.current.showNotification(title, options);
      } else {
        const notification = new Notification(title, options);
        notification.onclick = () => {
          const target = data.url || '/notifications';
          window.focus();
          window.location.href = target;
        };
      }
    } catch (err) {
      console.warn('System notification failed:', err);
    }
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserPermission('unsupported');
      return 'unsupported';
    }

    const result = await Notification.requestPermission();
    setBrowserPermission(result);
    return result;
  }, []);

  const subscribeForPush = useCallback(async (userId) => {
    if (!userId || browserPermission !== 'granted' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.warn('VITE_VAPID_PUBLIC_KEY is missing. Push subscription skipped.');
      return false;
    }

    try {
      const reg = swRegistrationRef.current || await navigator.serviceWorker.ready;
      swRegistrationRef.current = reg;

      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      if (pushEndpointRef.current === subscription.endpoint) {
        return true;
      }

      const res = await fetch(`${API_BASE}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription }),
      });

      if (!res.ok) {
        throw new Error('Failed to register push subscription');
      }

      pushEndpointRef.current = subscription.endpoint;
      localStorage.setItem('yathrika_push_subscribed_for', userId);
      return true;
    } catch (err) {
      console.warn('Push subscription failed:', err.message || err);
      return false;
    }
  }, [browserPermission]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        swRegistrationRef.current = reg;
      })
      .catch((err) => {
        console.warn('Service worker registration failed:', err.message || err);
      });
  }, []);

  useEffect(() => {
    const userId = user?.phoneNumber;
    if (!userId || !('Notification' in window)) return;

    const initPush = async () => {
      const prompted = localStorage.getItem('yathrika_push_prompted') === 'yes';
      let permission = Notification.permission;

      if (!prompted && permission === 'default') {
        permission = await requestBrowserPermission();
        localStorage.setItem('yathrika_push_prompted', 'yes');
      }

      setBrowserPermission(permission);

      if (permission === 'granted') {
        await subscribeForPush(userId);
      }
    };

    initPush();
  }, [user?.phoneNumber, requestBrowserPermission, subscribeForPush]);

  const showNotification = useCallback(({ type = 'info', title, message, duration = 4000, system = false, data = {} }) => {
    const id = Date.now() + Math.random();
    const notification = { id, type, title, message, timestamp: new Date() };

    setToasts(prev => [notification, ...prev].slice(0, 5));
    setHistory(prev => [notification, ...prev]);

    setTimeout(() => {
      setToasts(prev => prev.filter(n => n.id !== id));
    }, duration);

    if (system || document.visibilityState !== 'visible') {
      showSystemNotification({ type, title, message, data });
    }

    return id;
  }, [showSystemNotification]);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setHistory(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = history.filter(n => !n.read).length;

  const notify = {
    paymentSuccess: (amount) =>
      showNotification({
        type: 'success',
        title: 'Payment Successful',
        message: `Rs.${amount} paid successfully. Your order is confirmed.`,
        system: true,
        data: { url: '/order-summary', type: 'payment_success' },
      }),

    paymentFailed: (reason) =>
      showNotification({
        type: 'error',
        title: 'Payment Failed',
        message: reason || 'Your payment could not be processed. Please try again.',
        duration: 6000,
        system: true,
        data: { url: '/payment', type: 'payment_failed' },
      }),

    orderConfirmed: (orderId) =>
      showNotification({
        type: 'success',
        title: 'Order Confirmed',
        message: `Order #${orderId || '---'} has been confirmed and is being prepared.`,
        system: true,
        data: { url: '/tracking', type: 'order_confirmed' },
      }),

    partnerAssigned: (partnerName) =>
      showNotification({
        type: 'info',
        title: 'Delivery Partner Assigned',
        message: `${partnerName || 'A delivery partner'} has been assigned to your order.`,
        system: true,
        data: { url: '/tracking', type: 'partner_assigned' },
      }),

    outForDelivery: (stop) =>
      showNotification({
        type: 'info',
        title: 'Out for Delivery',
        message: `Your order is on the way to ${stop || 'your bus stop'}.`,
        system: true,
        data: { url: '/tracking', type: 'out_for_delivery' },
      }),

    delivered: () =>
      showNotification({
        type: 'success',
        title: 'Order Delivered',
        message: 'Your order has been delivered at the bus stop.',
        duration: 6000,
        system: true,
        data: { url: '/order-history', type: 'delivered' },
      }),

    custom: (type, title, message) =>
      showNotification({ type, title, message }),
  };

  return (
    <NotificationContext.Provider
      value={{
        notify,
        showNotification,
        history,
        markAllRead,
        unreadCount,
        browserPermission,
        requestBrowserPermission,
        subscribeForPush,
      }}
    >
      {children}

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
