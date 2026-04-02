import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LiveMap from '../components/LiveMap';
import socketService from '../services/socketService';
import { calculateDistance, formatDistance, calculateETA, getBusStopCoordinates } from '../utils/locationUtils';
import '../index.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => typeof n === 'number' ? n.toLocaleString('en-IN') : '0';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';

// Persist partner stats — localStorage + backend
const persistPartner = (updated) => {
  localStorage.setItem('deliveryPartner', JSON.stringify(updated));
  // Update availability in DB (earnings update would need a dedicated endpoint)
  if (updated._id) {
    fetch(`/api/delivery-partner/${updated._id}/availability`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isOnline: updated.isOnline }),
    }).catch(() => {});
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
const DeliveryPartnerDashboard = () => {
  const navigate = useNavigate();
  const getOrderId = (order) => String(order?.orderId || order?.id || '');
  const acceptedOrdersStorageKey = (partnerId) => `yathrika_partner_accepted_${partnerId}`;

  const [partner,        setPartner]        = useState(null);
  const [availableOrders,setAvailableOrders]= useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [selectedOrder,  setSelectedOrder]  = useState(null);
  const [partnerLocation,setPartnerLocation]= useState(null);
  const [userLocations,  setUserLocations]  = useState({});
  const [handoverProofFiles, setHandoverProofFiles] = useState({});
  const [isOnline,       setIsOnline]       = useState(false);
  const [notifications,  setNotifications]  = useState([]);
  const acceptedOrdersRef = useRef([]);

  useEffect(() => {
    acceptedOrdersRef.current = acceptedOrders;
  }, [acceptedOrders]);

  // ── Auth + approval guard (checks live from backend) ────────────────────────
  useEffect(() => {
    let reconnectHandler = null;

    const startRealtime = (fresh) => {
      setPartner(fresh);
      setIsOnline(Boolean(fresh?.isOnline));

      const coords = getBusStopCoordinates(fresh.assignedBusStop);
      if (coords) setPartnerLocation({ latitude: coords.lat, longitude: coords.lng });

      socketService.connect();
      socketService.joinPartnerRoom(fresh.assignedBusStop, fresh._id);
      loadAvailableOrders(fresh.assignedBusStop);
      loadAcceptedOrders(fresh._id).then((orders) => {
        orders.forEach((o) => {
          socketService.joinTrackingRoom(getOrderId(o), 'delivery_partner', {
            partnerId: fresh._id,
            partnerName: fresh.name,
            busStop: fresh.assignedBusStop,
          });
        });
      });

      reconnectHandler = () => {
        socketService.joinPartnerRoom(fresh.assignedBusStop, fresh._id);
        acceptedOrdersRef.current.forEach((o) => {
          socketService.joinTrackingRoom(getOrderId(o), 'delivery_partner', {
            partnerId: fresh._id,
            partnerName: fresh.name,
            busStop: fresh.assignedBusStop,
          });
        });
      };
      socketService.onConnect(reconnectHandler);

      socketService.onOrderUpdate(handleOrderUpdate);
      socketService.onUserLocationUpdate(handleUserLocationUpdate);
      socketService.onOrderStatusUpdate(handleOrderStatusUpdate);
      socketService.onOrderStatusError(handleOrderStatusError);
    };

    const raw   = localStorage.getItem('deliveryPartner');
    const token = localStorage.getItem('deliveryPartnerToken');
    if (!raw || !token) { navigate('/delivery-partner-auth'); return; }

    const p = JSON.parse(raw);
    if (!p?._id) { navigate('/delivery-partner-auth'); return; }

    // Always verify approval status from the backend (not localStorage)
    fetch(`/api/delivery-partner/${p._id}/status`)
      .then(r => r.json())
      .then(data => {
        const fresh = data.partner || p;
        localStorage.setItem('deliveryPartner', JSON.stringify(fresh));

        if (fresh.approvalStatus === 'pending')  { navigate('/delivery-partner-pending'); return; }
        if (fresh.approvalStatus === 'rejected') { navigate('/delivery-partner-auth');    return; }

        startRealtime(fresh);
      })
      .catch(() => {
        // Network error: use cached value but still guard
        const fresh = p;
        if (fresh.approvalStatus !== 'approved') { navigate('/delivery-partner-auth'); return; }
        startRealtime(fresh);
      });

    return () => {
      if (reconnectHandler) socketService.offConnect(reconnectHandler);
      socketService.removeAllListeners();
    };
  }, [navigate]);

  // ── Load real orders from backend (filtered by partner's assigned bus stop) ──
  const loadAvailableOrders = async (busStop) => {
    try {
      if (!busStop) return;
      const res = await fetch(`/api/orders/pending/${encodeURIComponent(busStop)}`);
      const data = await res.json();
      setAvailableOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };
  const loadAcceptedOrders = async (partnerId) => {
    if (!partnerId) {
      setAcceptedOrders([]);
      return [];
    }

    try {
      const res = await fetch(`/api/orders/partner/${encodeURIComponent(partnerId)}/active`);
      if (res.ok) {
        const data = await res.json();
        const activeFromServer = Array.isArray(data?.orders) ? data.orders : [];
        setAcceptedOrders(activeFromServer);
        localStorage.setItem(acceptedOrdersStorageKey(partnerId), JSON.stringify(activeFromServer));
        return activeFromServer;
      }
    } catch (_) {}

    try {
      const saved = localStorage.getItem(acceptedOrdersStorageKey(partnerId));
      if (!saved) {
        setAcceptedOrders([]);
        return [];
      }
      const parsed = JSON.parse(saved);
      const activeOrders = Array.isArray(parsed)
        ? parsed.filter((o) => !['handover', 'cancelled'].includes(o?.status))
        : [];
      setAcceptedOrders(activeOrders);
      return activeOrders;
    } catch {
      setAcceptedOrders([]);
      return [];
    }
  };

  const syncPartnerFromServer = async (partnerId) => {
    if (!partnerId) return;
    try {
      const res = await fetch(`/api/delivery-partner/${partnerId}/performance`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.partner) {
        setPartner(data.partner);
        localStorage.setItem('deliveryPartner', JSON.stringify(data.partner));
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (!partner?._id) return;
    localStorage.setItem(
      acceptedOrdersStorageKey(partner._id),
      JSON.stringify(acceptedOrders)
    );
  }, [acceptedOrders, partner?._id]);

  // ── Socket handlers ──────────────────────────────────────────────────────────
  const handleOrderUpdate = (data) => {
    if (data.type === 'new_order') {
      setAvailableOrders(prev => [data.order, ...prev]);
      toast({ type:'new_order', message:`New order: ₹${data.order.total}` });
    } else if (data.type === 'order_accepted') {
      setAvailableOrders(prev => prev.filter(o => getOrderId(o) !== String(data.orderId)));
    } else if (data.type === 'order_cancelled') {
      setAvailableOrders(prev => prev.filter(o => getOrderId(o) !== String(data.orderId)));
      setAcceptedOrders(prev => prev.filter(o => getOrderId(o) !== String(data.orderId)));
      toast({ type:'info', message:`Order #${String(data.orderId).slice(-6)} was cancelled by user` });
    }
  };
  const handleUserLocationUpdate = ({ orderId, location }) =>
    setUserLocations(prev => ({ ...prev, [orderId]: location }));
  const handleOrderStatusUpdate = ({ orderId, status }) =>
    setAcceptedOrders((prev) => {
      if (['handover', 'cancelled'].includes(status)) {
        return prev.filter((o) => getOrderId(o) !== String(orderId));
      }
      return prev.map((o) => getOrderId(o) === String(orderId) ? { ...o, status } : o);
    });
  const handleOrderStatusError = ({ message }) => {
    toast({ type:'error', message: message || 'Unable to update order status' });
  };

  const uploadHandoverProof = async (orderId, file) => {
    const payload = new FormData();
    payload.append('partnerId', partner._id);
    payload.append('busPhoto', file);

    const res = await fetch(`/api/orders/${orderId}/handover-proof`, {
      method: 'POST',
      body: payload,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to upload handover proof');
    }

    return data.handoverProofImageUrl;
  };

  // ── Accept order — calls backend, broadcasts via socket ─────────────────────
  const acceptOrder = async (order) => {
    const orderId = order.orderId || order.id;
    try {
      const partnerInfo = {
        partnerId:   partner._id,
        partnerName: partner.name,
        name:        partner.name,
        phone:       partner.phone,
        vehicleType: partner.vehicleType || 'Bike',
        busStop:     partner.assignedBusStop,
      };

      const res = await fetch(`/api/orders/${orderId}/accept`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ busStop: partner.assignedBusStop, partnerInfo }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ type:'error', message: err.message || 'Could not accept order' });
        return;
      }

      const ao = {
        ...order,
        id: orderId,
        orderId,
        status: 'confirmed',
        acceptedAt: new Date().toISOString(),
        partnerId: partner._id,
        partnerName: partner.name,
        partnerPhone: partner.phone,
      };
      setAcceptedOrders(prev => [ao, ...prev]);
      setAvailableOrders(prev => prev.filter(o => String(o.orderId || o.id) !== String(orderId)));

      // Join the tracking room so we can receive user location updates
      socketService.joinTrackingRoom(orderId, 'delivery_partner', {
        partnerId: partner._id, partnerName: partner.name, busStop: partner.assignedBusStop
      });

      toast({ type:'success', message:`Order #${orderId.slice(-6)} accepted` });
    } catch (err) {
      console.error('Accept order error:', err);
      toast({ type:'error', message:'Network error. Please try again.' });
    }
  };

  // ── Update status (HANDOVER = order complete → update earnings) ──────────────
  const updateOrderStatus = async (orderId, newStatus) => {
    const normalizedOrderId = String(orderId);
    const order = acceptedOrders.find(o => getOrderId(o) === normalizedOrderId);
    const reward = Number(order?.pickupReward || 0);
    let handoverProofImageUrl = '';

    if (newStatus === 'handover') {
      const proofFile = handoverProofFiles[normalizedOrderId];
      if (!proofFile) {
        toast({ type:'error', message:'Upload a bus handover photo before marking HANDOVER' });
        return;
      }
      try {
        handoverProofImageUrl = await uploadHandoverProof(normalizedOrderId, proofFile);
      } catch (err) {
        toast({ type:'error', message: err.message || 'Failed to upload handover proof' });
        return;
      }
    }

    setAcceptedOrders(prev => prev.map(o => getOrderId(o) === normalizedOrderId ? { ...o, status:newStatus } : o));
    socketService.updateOrderStatus(orderId, newStatus, {
      partnerId:partner._id,
      reward,
      handoverProofImageUrl,
    });

    if (newStatus === 'handover') {
      setAcceptedOrders(prev => prev.filter(o => getOrderId(o) !== normalizedOrderId));
      syncPartnerFromServer(partner?._id);
      toast({ type:'success', message:`Order complete! +₹${reward} earned` });
    } else {
      toast({ type:'info', message:`Status → ${newStatus.replace(/_/g,' ').toUpperCase()}` });
    }
  };

  const toggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    socketService.updatePartnerAvailability(partner._id, next);
    toast({ type:'info', message:`You are now ${next ? 'Online' : 'Offline'}` });
  };

  const logout = async () => {
    if (partner?._id) {
      await fetch(`/api/delivery-partner/${partner._id}/availability`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: false }),
      }).catch(() => {});
    }
    localStorage.removeItem('deliveryPartnerToken');
    socketService.disconnect();
    navigate('/delivery-partner-auth');
  };

  const toast = (n) => {
    const item = { ...n, id: Date.now() };
    setNotifications(prev => [item, ...prev.slice(0, 4)]);
    setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== item.id)), 5000);
  };

  if (!partner) {
    return <div className="loading-container"><div className="loading-spinner"></div><p>Loading…</p></div>;
  }

  const statusButtons = [
    { status:'confirmed',       label:'CONFIRMED',       color:'#2196F3' },
    { status:'packed',          label:'PACKED',          color:'#FF9800' },
    { status:'partner_at_stop', label:'PARTNER AT STOP', color:'#9C27B0' },
    { status:'handover',        label:'HANDOVER',        color:'#4CAF50' },
  ];

  const lastCredit = partner.creditHistory?.slice(-1)[0] || null;

  return (
    <div className="partner-dashboard-container">
      <div className="partner-dashboard-wrapper">

        {/* ── Header ── */}
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
              <button onClick={toggleOnline} className={`partner-status-toggle ${isOnline ? 'online' : 'offline'}`}>
                <i className="material-icons">{isOnline ? 'wifi' : 'wifi_off'}</i>
                {isOnline ? 'Online' : 'Offline'}
              </button>
              <button onClick={logout} className="partner-logout-button">
                <i className="material-icons">exit_to_app</i>
              </button>
            </div>
          </div>
        </header>

        {/* ── Toast notifications ── */}
        {notifications.length > 0 && (
          <div className="partner-notifications">
            {notifications.map(n => (
              <div key={n.id} className={`partner-notification ${n.type}`}>
                <i className="material-icons">{n.type==='error'?'error':n.type==='success'?'check_circle':n.type==='new_order'?'shopping_cart':'info'}</i>
                <span>{n.message}</span>
              </div>
            ))}
          </div>
        )}

        <main className="partner-dashboard-main">

          {/* ── STATS PANEL ──────────────────────────────────────────────────── */}
          <section style={DS.statsSection}>
            <h2 style={DS.sectionTitle}>Your Performance</h2>
            <div style={DS.statsGrid}>

              {/* Completed orders */}
              <div style={DS.statCard}>
                <div style={{ ...DS.statIcon, backgroundColor:'rgba(33,150,243,0.12)' }}>
                  <i className="material-icons" style={{ color:'#2196F3', fontSize:22 }}>local_shipping</i>
                </div>
                <p style={DS.statValue}>{fmt(partner.completedOrders)}</p>
                <p style={DS.statLabel}>Orders Completed</p>
              </div>

              {/* Total earnings */}
              <div style={DS.statCard}>
                <div style={{ ...DS.statIcon, backgroundColor:'rgba(104,249,26,0.12)' }}>
                  <i className="material-icons" style={{ color:'#68f91a', fontSize:22 }}>account_balance_wallet</i>
                </div>
                <p style={DS.statValue}>₹{fmt(partner.totalEarnings)}</p>
                <p style={DS.statLabel}>Total Earned</p>
              </div>

              {/* Pending earnings */}
              <div style={DS.statCard}>
                <div style={{ ...DS.statIcon, backgroundColor:'rgba(255,184,77,0.12)' }}>
                  <i className="material-icons" style={{ color:'#ffb84d', fontSize:22 }}>pending</i>
                </div>
                <p style={{ ...DS.statValue, color:'#ffb84d' }}>₹{fmt(partner.pendingEarnings)}</p>
                <p style={DS.statLabel}>Pending Payout</p>
              </div>

              {/* Total credited */}
              <div style={DS.statCard}>
                <div style={{ ...DS.statIcon, backgroundColor:'rgba(76,175,80,0.12)' }}>
                  <i className="material-icons" style={{ color:'#4CAF50', fontSize:22 }}>payments</i>
                </div>
                <p style={{ ...DS.statValue, color:'#4CAF50' }}>₹{fmt(partner.totalCredited)}</p>
                <p style={DS.statLabel}>Total Credited</p>
              </div>

            </div>

            {/* Last credit */}
            <div style={DS.creditRow}>
              <i className="material-icons" style={{ color: lastCredit ? '#4CAF50' : '#444', fontSize:18 }}>
                {lastCredit ? 'check_circle' : 'info'}
              </i>
              {lastCredit ? (
                <span style={{ color:'#aaa', fontSize:'0.82rem' }}>
                  Last credit: <strong style={{ color:'#4CAF50' }}>₹{fmt(lastCredit.amount)}</strong>
                  {' '}on {fmtDate(lastCredit.creditedAt)}
                  {lastCredit.note ? <em style={{ color:'#666' }}> — {lastCredit.note}</em> : ''}
                </span>
              ) : (
                <span style={{ color:'#555', fontSize:'0.82rem' }}>No credits received yet</span>
              )}
            </div>

            {/* Credit history mini-log */}
            {partner.creditHistory?.length > 0 && (
              <details style={{ marginTop:6 }}>
                <summary style={{ color:'#68f91a', fontSize:'0.78rem', cursor:'pointer', fontWeight:600 }}>
                  View credit history ({partner.creditHistory.length})
                </summary>
                <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:6 }}>
                  {[...partner.creditHistory].reverse().map((c, i) => (
                    <div key={i} style={DS.creditHistRow}>
                      <span style={{ color:'#4CAF50', fontWeight:700, fontSize:'0.82rem' }}>+₹{fmt(c.amount)}</span>
                      <span style={{ color:'#888', fontSize:'0.78rem', flex:1 }}>{c.note || '—'}</span>
                      <span style={{ color:'#555', fontSize:'0.72rem' }}>{fmtDate(c.creditedAt)}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </section>

          {/* ── AVAILABLE ORDERS ─────────────────────────────────────────────── */}
          <section className="partner-section">
            <div className="partner-section-header">
              <h2>Available Orders ({availableOrders.length})</h2>
              <button onClick={() => loadAvailableOrders(partner?.assignedBusStop)} className="partner-refresh-button">
                <i className="material-icons">refresh</i> Refresh
              </button>
            </div>

            {availableOrders.length === 0 ? (
              <div className="partner-no-orders">
                <i className="material-icons">inbox</i>
                <p>No available orders</p>
                <p>You'll be notified when new orders arrive</p>
              </div>
            ) : (
              <div className="partner-orders-grid">
                {availableOrders.map(order => (
                  <div key={getOrderId(order)} className="partner-order-card available">
                    <div className="order-header">
                      <div>
                        <h3 className="order-id">#{String(getOrderId(order)).slice(-6)}</h3>
                        <p className="order-customer">{order.userName}</p>
                        <p className="order-time">{Math.floor((new Date()-order.createdAt)/60000)} min ago</p>
                      </div>
                      <div className="order-reward">
                        <i className="material-icons">payment</i>
                        <span>₹{order.pickupReward}</span>
                      </div>
                    </div>
                    <div className="order-details">
                      <div className="order-items">{order.items.map((item,i) => <span key={i} className="order-item">{item.name} ×{item.quantity}</span>)}</div>
                      <div className="order-info"><span>Total: ₹{order.total}</span><span>Route: {order.busRoute}</span></div>
                    </div>
                    <div className="order-actions">
                      <button onClick={() => acceptOrder(order)} className="partner-action-button primary" disabled={!isOnline}>
                        <i className="material-icons">add_task</i> Accept Order
                      </button>
                      <button onClick={() => window.open(`tel:${order.userPhone}`)} className="partner-action-button secondary">
                        <i className="material-icons">call</i> Call
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── ACCEPTED ORDERS ──────────────────────────────────────────────── */}
          {acceptedOrders.length > 0 && (
            <section className="partner-section">
              <div className="partner-section-header">
                <h2>My Orders ({acceptedOrders.length})</h2>
              </div>
              <div className="partner-orders-grid">
                {acceptedOrders.map(order => (
                  <div key={getOrderId(order)} className="partner-order-card accepted">
                    <div className="order-header">
                      <div>
                        <h3 className="order-id">#{String(getOrderId(order)).slice(-6)}</h3>
                        <p className="order-customer">{order.userName}</p>
                      </div>
                      <div className={`order-status ${order.status}`}>
                        {order.status.replace(/_/g,' ').toUpperCase()}
                      </div>
                    </div>
                    <div className="order-details">
                      <div className="order-items">{order.items.map((item,i) => <span key={i} className="order-item">{item.name} ×{item.quantity}</span>)}</div>
                      <div className="order-info"><span>Total: ₹{order.total}</span><span>Reward: ₹{order.pickupReward}</span></div>
                      {userLocations[getOrderId(order)] && <div className="order-tracking-info"><i className="material-icons">near_me</i><span>Customer approaching</span></div>}
                    </div>
                    <div className="partner-auth-field" style={{ marginTop:8 }}>
                      <label style={{ color:'#ffb84d' }}>Bus Photo Proof (required for HANDOVER)</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setHandoverProofFiles(prev => ({ ...prev, [getOrderId(order)]: file }));
                        }}
                      />
                    </div>
                    <div className="order-status-buttons">
                      {statusButtons.map(({ status, label, color }) => (
                        <button key={status}
                          onClick={() => updateOrderStatus(getOrderId(order), status)}
                          className={`status-button ${order.status===status?'active':''}`}
                          style={{ borderColor:color, backgroundColor:order.status===status?color:'transparent', color:order.status===status?'white':color }}
                        >{label}</button>
                      ))}
                    </div>
                    <div className="order-actions">
                      <button onClick={() => setSelectedOrder(order)} className="partner-action-button primary">
                        <i className="material-icons">map</i> Track Customer
                      </button>
                      <button onClick={() => window.open(`tel:${order.userPhone}`)} className="partner-action-button secondary">
                        <i className="material-icons">call</i> Call Customer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── COMPLETED ORDERS HISTORY (from MongoDB) ─────────────────────── */}
          {(partner?.completedOrderLog?.length || 0) > 0 && (
            <section className="partner-section">
              <div className="partner-section-header">
                <h2>Completed Orders ({partner.completedOrderLog.length})</h2>
              </div>
              <div className="partner-orders-grid">
                {[...(partner.completedOrderLog || [])].slice().reverse().slice(0, 12).map((entry) => (
                  <div key={`${entry.orderId}_${entry.completedAt}`} className="partner-order-card accepted">
                    <div className="order-header">
                      <div>
                        <h3 className="order-id">#{String(entry.orderId).slice(-6)}</h3>
                        <p className="order-customer">Delivered</p>
                      </div>
                      <div className="order-status handover">HANDOVER</div>
                    </div>
                    <div className="order-details">
                      <div className="order-info">
                        <span>Reward: ₹{fmt(entry.reward || 0)}</span>
                        <span>{entry.completedAt ? new Date(entry.completedAt).toLocaleString('en-IN') : '—'}</span>
                      </div>
                      {entry.handoverProofImageUrl && (
                        <div className="order-info" style={{ marginTop:6 }}>
                          <a href={entry.handoverProofImageUrl} target="_blank" rel="noreferrer" style={{ color:'#68f91a', fontSize:'0.78rem', textDecoration:'underline' }}>
                            View handover proof
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── LIVE MAP ─────────────────────────────────────────────────────── */}
          {selectedOrder && (
            <section className="partner-section">
              <div className="partner-section-header">
                <h3>Tracking Order #{String(getOrderId(selectedOrder)).slice(-6)}</h3>
                <button onClick={() => setSelectedOrder(null)} className="partner-close-button">
                  <i className="material-icons">close</i>
                </button>
              </div>
              <LiveMap height="400px" userLocation={userLocations[getOrderId(selectedOrder)]} busStopLocation={getBusStopCoordinates(partner.assignedBusStop)} deliveryPartnerLocation={partnerLocation} className="partner-tracking-map" />
              {userLocations[getOrderId(selectedOrder)] && (
                <div className="partner-map-info">
                  <div className="partner-map-stats">
                    <div className="partner-stat"><i className="material-icons">person</i><div><p>{selectedOrder.userName}</p><p>Last seen: {new Date(userLocations[getOrderId(selectedOrder)].timestamp).toLocaleTimeString()}</p></div></div>
                    <div className="partner-stat"><i className="material-icons">local_shipping</i><div><p>Status</p><p>{selectedOrder.status.replace(/_/g,' ').toUpperCase()}</p></div></div>
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

// ─── Stats panel styles ───────────────────────────────────────────────────────
const DS = {
  statsSection: { margin:'16px 16px 0', backgroundColor:'rgba(255,255,255,0.03)', border:'1px solid rgba(104,249,26,0.1)', borderRadius:16, padding:'18px 16px', display:'flex', flexDirection:'column', gap:12 },
  sectionTitle: { color:'#fff', fontWeight:700, fontSize:'1rem', margin:0 },
  statsGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  statCard:     { backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'14px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:6, textAlign:'center' },
  statIcon:     { width:40, height:40, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' },
  statValue:    { color:'#fff', fontWeight:800, fontSize:'1.25rem', margin:0, fontVariantNumeric:'tabular-nums' },
  statLabel:    { color:'#666', fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', margin:0 },
  creditRow:    { display:'flex', alignItems:'center', gap:8, backgroundColor:'rgba(255,255,255,0.02)', borderRadius:10, padding:'10px 12px' },
  creditHistRow:{ display:'flex', alignItems:'center', gap:8, backgroundColor:'rgba(255,255,255,0.03)', borderRadius:8, padding:'8px 10px' },
};

export default DeliveryPartnerDashboard;