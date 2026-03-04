import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LiveMap from '../components/LiveMap';
import socketService from '../services/socketService';
import { useLanguage } from '../LanguageContext';
import {
  calculateDistance, formatDistance, calculateETA,
  getCurrentLocation, watchLocation, stopWatchingLocation,
  getBusStopCoordinates, generateRoutePath
} from '../utils/locationUtils';
import '../index.css';

const T = {
  en: {
    pageTitle:'Order Tracking', waitingTitle:'Looking for a Delivery Partner',
    waitingDesc:"We're finding an available delivery partner near your bus stop. This usually takes under a minute.",
    cancelIn:'Auto-cancel in', cancelledTitle:'Order Cancelled',
    cancelledDesc:'No delivery partner was available within 2 minutes. A full refund has been initiated to your original payment method.',
    refundNote:'Refund will be credited within 5–7 business days.', goHome:'Go to Home',
    orderId:'Order ID', paymentId:'Payment ID', total:'Total', deliveryStop:'Delivery Stop',
    items:'Items', paymentMethod:'Payment', partnerAssigned:'Delivery Partner Assigned!',
    yourPartner:'Your Delivery Partner', callPartner:'Call Partner', waitingAt:'Waiting at',
    liveLocation:'Live Location', orderDetails:'Order Details', delivery:'Delivery',
    deliveryLocation:'Delivery Location', enableLocation:'Enable Location Tracking',
    enableLocationDesc:'Allow location access to track your journey in real-time',
    enable:'Enable', distanceToStop:'Distance to Stop', liveETA:'Live ETA',
    arrivalCountdown:'Your order will arrive at the bus stop in',
    minutes:'Minutes', seconds:'Seconds',
    home:'Home', orders:'Orders', profile:'Profile', notifications:'Notifications',
    stageConfirmed:'CONFIRMED', stagePacked:'PACKED', stagePartnerStop:'PARTNER AT STOP', stageHandover:'HANDOVER',
    statusConfirmed:'Order Confirmed', statusPacked:'Order Packed',
    statusPartnerStop:'Partner Waiting', statusHandover:'Order Delivered! 🎉',
    msgConfirmed:'Your order has been confirmed and is being prepared.',
    msgPacked:'Your order is packed and ready for pickup.',
    msgPartnerStop:'Your delivery partner is waiting at the bus stop!',
    msgHandover:'Order delivered successfully! Enjoy.',
    inTransit:'On The Way', approaching:'Approaching Stop', arrived:'Arrived at Stop',
    msgInTransit:'You are on the way to the bus stop.',
    msgApproaching:'You are approaching the bus stop. Your partner is waiting.',
    msgArrived:'You have arrived at the bus stop. Look for your delivery partner.',
    trackingInfo:'Live Tracking Information', yourLocation:'Your Location',
    busLocation:'Bus Location', deliveryStopLegend:'Delivery Stop', partnerLegend:'Delivery Partner',
  },
  ml: {
    pageTitle:'ഓർഡർ ട്രാക്കിംഗ്', waitingTitle:'ഡെലിവറി പാർട്ണറെ കണ്ടെത്തുന്നു',
    waitingDesc:'നിങ്ങളുടെ ബസ് സ്റ്റോപ്പിനടുത്ത് ലഭ്യമായ ഡെലിവറി പാർട്ണറെ തിരയുന്നു. ഇത് സാധാരണ ഒരു മിനിറ്റിൽ താഴെ എടുക്കും.',
    cancelIn:'റദ്ദാക്കൽ', cancelledTitle:'ഓർഡർ റദ്ദാക്കി',
    cancelledDesc:'2 മിനിറ്റിനുള്ളിൽ ഡെലിവറി പാർട്ണർ ലഭ്യമായില്ല. നിങ്ങളുടെ യഥാർത്ഥ പേയ്‌മെന്റ് രീതിയിലേക്ക് പൂർണ്ണ റീഫണ്ട് ആരംഭിച്ചു.',
    refundNote:'5–7 ബിസിനസ് ദിവസങ്ങൾക്കുള്ളിൽ റീഫണ്ട് ലഭിക്കും.',
    goHome:'ഹോമിലേക്ക് പോകുക', orderId:'ഓർഡർ ഐഡി', paymentId:'പേയ്‌മെന്റ് ഐഡി',
    total:'ആകെ', deliveryStop:'ഡെലിവറി സ്റ്റോപ്പ്', items:'ഉൽപ്പന്നങ്ങൾ',
    paymentMethod:'പേയ്‌മെന്റ്', partnerAssigned:'ഡെലിവറി പാർട്ണർ നിയോഗിച്ചു!',
    yourPartner:'നിങ്ങളുടെ ഡെലിവറി പാർട്ണർ', callPartner:'പാർട്ണറെ വിളിക്കുക',
    waitingAt:'കാത്തിരിക്കുന്നത്', liveLocation:'തത്സമയ ലൊക്കേഷൻ',
    orderDetails:'ഓർഡർ വിവരങ്ങൾ', delivery:'ഡെലിവറി',
    deliveryLocation:'ഡെലിവറി ലൊക്കേഷൻ',
    enableLocation:'ലൊക്കേഷൻ ട്രാക്കിംഗ് പ്രവർത്തനക്ഷമമാക്കുക',
    enableLocationDesc:'തത്സമയ ട്രാക്കിംഗിനായി ലൊക്കേഷൻ ആക്സസ് അനുവദിക്കുക',
    enable:'പ്രവർത്തനക്ഷമമാക്കുക', distanceToStop:'സ്റ്റോപ്പിലേക്കുള്ള ദൂരം', liveETA:'ലൈവ് ETA',
    arrivalCountdown:'നിങ്ങളുടെ ഓർഡർ ബസ് സ്റ്റോപ്പിൽ എത്തും',
    minutes:'മിനിറ്റ്', seconds:'സെക്കൻഡ്',
    home:'ഹോം', orders:'ഓർഡറുകൾ', profile:'പ്രൊഫൈൽ', notifications:'അറിയിപ്പുകൾ',
    stageConfirmed:'സ്ഥിരീകരിച്ചു', stagePacked:'പാക്ക് ചെയ്തു',
    stagePartnerStop:'പാർട്ണർ സ്റ്റോപ്പിൽ', stageHandover:'ഹാൻഡ്ഓവർ',
    statusConfirmed:'ഓർഡർ സ്ഥിരീകരിച്ചു', statusPacked:'ഓർഡർ പാക്ക് ചെയ്തു',
    statusPartnerStop:'പാർട്ണർ കാത്തിരിക്കുന്നു', statusHandover:'ഓർഡർ ഡെലിവർ ചെയ്തു! 🎉',
    msgConfirmed:'നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിച്ചു, തയ്യാറാക്കുന്നു.',
    msgPacked:'ഓർഡർ പാക്ക് ചെയ്ത് പിക്കപ്പിന് തയ്യാർ.',
    msgPartnerStop:'ഡെലിവറി പാർട്ണർ ബസ് സ്റ്റോപ്പിൽ കാത്തിരിക്കുന്നു!',
    msgHandover:'ഓർഡർ വിജയകരമായി ഡെലിവർ ചെയ്തു! ആസ്വദിക്കൂ.',
    inTransit:'വഴിയിൽ', approaching:'സ്റ്റോപ്പ് അടുക്കുന്നു', arrived:'എത്തിച്ചേർന്നു',
    msgInTransit:'നിങ്ങൾ ബസ് സ്റ്റോപ്പിലേക്ക് പോകുന്നു.',
    msgApproaching:'നിങ്ങൾ ബസ് സ്റ്റോപ്പിനോട് അടുക്കുന്നു. പാർട്ണർ കാത്തിരിക്കുന്നു.',
    msgArrived:'നിങ്ങൾ ബസ് സ്റ്റോപ്പിൽ എത്തി. ഡെലിവറി പാർട്ണറെ കണ്ടെത്തുക.',
    trackingInfo:'തത്സമയ ട്രാക്കിംഗ് വിവരങ്ങൾ', yourLocation:'നിങ്ങളുടെ ലൊക്കേഷൻ',
    busLocation:'ബസ് ലൊക്കേഷൻ', deliveryStopLegend:'ഡെലിവറി സ്റ്റോപ്പ്',
    partnerLegend:'ഡെലിവറി പാർട്ണർ',
  },
};

const CANCEL_SECS = 120;

const Tracking = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = T[language] || T.en;

  const [orderData,               setOrderData]               = useState(null);
  const [partnerAccepted,         setPartnerAccepted]         = useState(false);
  const [orderCancelled,          setOrderCancelled]          = useState(false);
  const [cancelSecs,              setCancelSecs]              = useState(CANCEL_SECS);
  const [timeRemaining,           setTimeRemaining]           = useState({ minutes: 15, seconds: 0 });
  const [userLocation,            setUserLocation]            = useState(null);
  const [busLocation,             setBusLocation]             = useState(null);
  const [deliveryPartnerLocation, setDeliveryPartnerLocation] = useState(null);
  const [journeyStatus,           setJourneyStatus]           = useState('confirmed');
  const [isLocationEnabled,       setIsLocationEnabled]       = useState(false);
  const [locationError,           setLocationError]           = useState(null);
  const [watchId,                 setWatchId]                 = useState(null);
  const [distance,                setDistance]                = useState(null);
  const [routePath,               setRoutePath]               = useState([]);
  const [liveETA,                 setLiveETA]                 = useState(null);
  const [notifications,           setNotifications]           = useState([]);
  const [assignedPartner,         setAssignedPartner]         = useState(null);
  const [orderStatus,             setOrderStatus]             = useState('pending');

  const cancelRef   = useRef(null);
  const deliveryRef = useRef(null);

  // Load order data from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yathrika_current_order');
      if (saved) { setOrderData(JSON.parse(saved)); return; }
      const busStop   = JSON.parse(localStorage.getItem('yathrika_bus_stop') || 'null');
      const cartItems = JSON.parse(localStorage.getItem('yathrika_cart') || '[]');
      const subtotal  = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
      setOrderData({ orderId: 'ORD' + Date.now().toString().slice(-8), paymentId: null, amount: subtotal + 40 - 20, cartItems, paymentMethod: 'upi', busStop });
    } catch (_) {}
  }, []);

  // 2-min auto-cancel countdown
  useEffect(() => {
    if (partnerAccepted || orderCancelled) return;
    cancelRef.current = setInterval(() => {
      setCancelSecs(prev => {
        if (prev <= 1) { clearInterval(cancelRef.current); setOrderCancelled(true); setOrderStatus('cancelled'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cancelRef.current);
  }, [partnerAccepted, orderCancelled]);

  // Delivery countdown — starts only after partner accepts
  useEffect(() => {
    if (!partnerAccepted || orderCancelled) return;
    setTimeRemaining({ minutes: 15, seconds: 0 });
    deliveryRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        clearInterval(deliveryRef.current);
        return { minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(deliveryRef.current);
  }, [partnerAccepted, orderCancelled]);

  // Socket + location
  useEffect(() => {
    if (!orderData) return;
    socketService.connect();
    socketService.joinTrackingRoom(orderData.orderId, 'user', { userId: orderData.userId || 'user', orderId: orderData.orderId });
    initLoc();
    socketService.onLocationUpdate(onLocUpdate);
    socketService.onDeliveryStatusUpdate(onDeliveryStatus);
    socketService.onAlert(onAlert);
    socketService.onPartnerStatusUpdate(onPartnerStatus);
    socketService.onOrderStatusUpdate(onOrderStatus);
    return () => {
      if (watchId) stopWatchingLocation(watchId);
      socketService.leaveTrackingRoom(orderData.orderId);
      socketService.removeAllListeners();
      clearInterval(cancelRef.current);
      clearInterval(deliveryRef.current);
    };
  }, [orderData]);

  const initLoc = async () => {
    try {
      const loc = await getCurrentLocation();
      setUserLocation(loc); setIsLocationEnabled(true); setLocationError(null);
      if (orderData) socketService.updateLocation(orderData.orderId, { ...loc, type: 'user' });
      const id = watchLocation(nl => {
        setUserLocation(nl);
        if (orderData) { socketService.updateLocation(orderData.orderId, { ...nl, type: 'user' }); if (partnerAccepted) updateJourneyLoc(nl); }
      });
      setWatchId(id);
    } catch { setLocationError(t.enableLocationDesc); setIsLocationEnabled(false); }
  };

  const updateJourneyLoc = (loc) => {
    const coords = getBusStopCoordinates(orderData?.busStop?.name || '');
    if (!coords) return;
    const dist = calculateDistance(loc.latitude, loc.longitude, coords.lat, coords.lng);
    setDistance(dist); setLiveETA(calculateETA(dist));
    let ns = journeyStatus;
    if      (dist < 0.1) ns = 'arrived';
    else if (dist < 0.5) ns = 'approaching_stop';
    else if (dist < 5)   ns = 'in_transit';
    if (ns !== journeyStatus) {
      setJourneyStatus(ns);
      socketService.updateJourneyStatus(orderData.orderId, ns, { distance: dist });
      if (ns === 'in_transit' || ns === 'approaching_stop')
        setRoutePath(generateRoutePath({ lat: loc.latitude, lng: loc.longitude }, coords));
    }
  };

  const onLocUpdate = ({ location, userType }) => {
    if      (userType === 'delivery_partner') setDeliveryPartnerLocation(location);
    else if (userType === 'bus')              setBusLocation(location);
  };
  const onDeliveryStatus = ({ status, location }) => {
    if (location) setDeliveryPartnerLocation(location);
    toast({ type: 'delivery_update', message: `Delivery partner ${status}` });
  };
  const onAlert = (d) => toast({ type: 'alert', message: d.message });

  // ← This is where partner acceptance unlocks the tracking UI
  const onPartnerStatus = (data) => {
    if (data.orderId !== orderData?.orderId) return;
    clearInterval(cancelRef.current);
    setAssignedPartner(data.partner);
    setPartnerAccepted(true);
    setOrderStatus('confirmed');
    toast({ type: 'success', message: `${t.partnerAssigned} ${data.partner.name}` });
  };

  const onOrderStatus = (data) => {
    if (data.orderId !== orderData?.orderId) return;
    setOrderStatus(data.status);
    const m = { confirmed: t.msgConfirmed, packed: t.msgPacked, partner_at_stop: t.msgPartnerStop, handover: t.msgHandover };
    toast({ type: data.status === 'handover' ? 'success' : 'info', message: m[data.status] || data.status });
  };

  const toast = (n) => {
    const item = { ...n, id: Date.now() };
    setNotifications(prev => [item, ...prev].slice(0, 5));
    setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== item.id)), 5000);
  };

  const getStatusTitle = () => {
    const m = { confirmed: t.statusConfirmed, packed: t.statusPacked, partner_at_stop: t.statusPartnerStop, handover: t.statusHandover };
    if (m[orderStatus]) return m[orderStatus];
    return { in_transit: t.inTransit, approaching_stop: t.approaching, arrived: t.arrived }[journeyStatus] || t.statusConfirmed;
  };
  const getStatusMsg = () => {
    const m = { confirmed: t.msgConfirmed, packed: t.msgPacked, partner_at_stop: t.msgPartnerStop, handover: t.msgHandover };
    if (m[orderStatus]) return m[orderStatus];
    return { in_transit: t.msgInTransit, approaching_stop: t.msgApproaching, arrived: t.msgArrived }[journeyStatus] || t.msgConfirmed;
  };
  const progressW = () => {
    const steps = ['confirmed','packed','partner_at_stop','handover'];
    const i = steps.indexOf(orderStatus);
    if (i >= 0) return `${((i+1)/steps.length)*100}%`;
    const ji = ['confirmed','in_transit','approaching_stop','arrived'].indexOf(journeyStatus);
    return `${((ji+1)/4)*100}%`;
  };

  const trackingStages = [
    { name: t.stageConfirmed,   active: ['confirmed','packed','partner_at_stop','handover'].includes(orderStatus) },
    { name: t.stagePacked,      active: ['packed','partner_at_stop','handover'].includes(orderStatus) },
    { name: t.stagePartnerStop, active: ['partner_at_stop','handover'].includes(orderStatus) },
    { name: t.stageHandover,    active: orderStatus === 'handover' },
  ];

  const stopName       = orderData?.busStop?.name || '—';
  const shortOrderId   = orderData?.orderId  ? String(orderData.orderId).slice(-10).toUpperCase()  : '—';
  const shortPaymentId = orderData?.paymentId ? String(orderData.paymentId).slice(-12).toUpperCase() : null;
  const cancelMin      = Math.floor(cancelSecs/60);
  const cancelSec      = cancelSecs % 60;
  const methodLabel    = { upi:'UPI', card:'Debit/Credit Card', netbanking:'Netbanking', wallet:'Wallet' }[orderData?.paymentMethod] || 'Online';

  // CANCELLED SCREEN
  if (orderCancelled) return (
    <div style={S.page}>
      <div style={S.centre}>
        <div style={{ fontSize:56, marginBottom:16 }}>😔</div>
        <h2 style={{ color:'#ff4d4d', fontWeight:800, margin:'0 0 12px', fontSize:'1.3rem', textAlign:'center' }}>{t.cancelledTitle}</h2>
        <p style={{ color:'#aaa', textAlign:'center', lineHeight:1.65, margin:'0 0 8px', fontSize:'0.88rem', maxWidth:320 }}>{t.cancelledDesc}</p>
        <p style={{ color:'#68f91a', fontSize:'0.78rem', textAlign:'center', marginBottom:32 }}>{t.refundNote}</p>
        {orderData && (
          <div style={S.miniCard}>
            <div style={S.miniRow}><span style={S.mL}>{t.orderId}</span><span style={S.mV}>#{shortOrderId}</span></div>
            <div style={S.miniRow}><span style={S.mL}>{t.total}</span><span style={{ ...S.mV, color:'#68f91a' }}>₹{orderData.amount}</span></div>
          </div>
        )}
        <button style={S.btn} onClick={() => navigate('/yathrika-home')}>{t.goHome}</button>
      </div>
      <style>{`@keyframes ripple{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.5);opacity:0}}`}</style>
    </div>
  );

  // WAITING SCREEN
  if (!partnerAccepted) return (
    <div style={S.page}>
      <header style={S.hdr}>
        <Link to="/order-history" style={{ color:'#fff', display:'flex', alignItems:'center', textDecoration:'none' }}><span className="material-symbols-outlined">arrow_back</span></Link>
        <h1 style={{ color:'#fff', fontSize:'1.1rem', fontWeight:700, margin:0 }}>{t.pageTitle}</h1>
        <div style={{ width:40 }} />
      </header>
      <div style={S.centre}>
        <div style={S.ring}><div style={S.ringIn}><span className="material-symbols-outlined" style={{ fontSize:38, color:'#68f91a' }}>delivery_dining</span></div></div>
        <h2 style={{ color:'#fff', fontWeight:700, margin:'22px 0 10px', textAlign:'center', fontSize:'1.2rem' }}>{t.waitingTitle}</h2>
        <p style={{ color:'#888', textAlign:'center', lineHeight:1.65, margin:'0 0 28px', fontSize:'0.85rem', maxWidth:300 }}>{t.waitingDesc}</p>
        <div style={S.cancelBox}>
          <span className="material-symbols-outlined" style={{ fontSize:18, color:'#ffb84d' }}>timer</span>
          <span style={{ color:'#ffb84d', fontSize:'0.85rem', fontWeight:600 }}>{t.cancelIn}: {String(cancelMin).padStart(2,'0')}:{String(cancelSec).padStart(2,'0')}</span>
        </div>
        {orderData && (
          <div style={S.miniCard}>
            <div style={S.miniRow}><span style={S.mL}>{t.orderId}</span><span style={S.mV}>#{shortOrderId}</span></div>
            <div style={S.miniRow}><span style={S.mL}>{t.total}</span><span style={{ ...S.mV, color:'#68f91a' }}>₹{orderData.amount}</span></div>
            <div style={S.miniRow}><span style={S.mL}>{t.deliveryStop}</span><span style={S.mV}>{stopName}</span></div>
            {orderData.cartItems?.length > 0 && (
              <div style={{ ...S.miniRow, flexDirection:'column', alignItems:'flex-start', gap:4 }}>
                <span style={S.mL}>{t.items}</span>
                <span style={{ ...S.mV, fontSize:'0.77rem', opacity:0.8 }}>{orderData.cartItems.map(i=>`${i.name} ×${i.quantity}`).join(' · ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes ripple{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.5);opacity:0}}`}</style>
    </div>
  );

  // MAIN TRACKING SCREEN
  return (
    <div className="tracking-page-container">
      <div className="tracking-content-wrapper">
        <header className="tracking-header">
          <Link to="/order-history" className="tracking-back-button"><span className="material-symbols-outlined">arrow_back</span></Link>
          <h1 className="tracking-page-title">{t.pageTitle}</h1>
          <div className="tracking-header-spacer"></div>
        </header>

        <main className="tracking-main-content">
          {!isLocationEnabled && (
            <div className="tracking-location-notice">
              <div className="location-notice-content">
                <span className="material-symbols-outlined">location_off</span>
                <div><h3>{t.enableLocation}</h3><p>{locationError || t.enableLocationDesc}</p></div>
                <button onClick={initLoc} className="location-enable-button">{t.enable}</button>
              </div>
            </div>
          )}

          {notifications.length > 0 && (
            <div className="tracking-notifications">
              {notifications.map(n => (
                <div key={n.id} className={`tracking-notification ${n.type}`}>
                  <span className="material-symbols-outlined">{n.type==='alert'?'warning':n.type==='success'?'check_circle':'info'}</span>
                  <span>{n.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="tracking-progress-card">
            <div className="tracking-stages-section">
              <div className="tracking-stages-labels">
                {trackingStages.map((s,i) => (
                  <span key={i} className={s.active?'tracking-stage-active':'tracking-stage-inactive'}>{s.name}</span>
                ))}
              </div>
              <div className="tracking-progress-bar-container">
                <div className="tracking-progress-bar" style={{ width:progressW(), transition:'width 0.6s ease' }} />
              </div>
            </div>
            <div className="tracking-status-section">
              <h2 className="tracking-status-title">{getStatusTitle()}</h2>
              <p className="tracking-status-description">{getStatusMsg()}</p>
              {isLocationEnabled && distance && (
                <div className="tracking-live-stats">
                  <div className="tracking-stat">
                    <span className="material-symbols-outlined">near_me</span>
                    <div><p className="stat-label">{t.distanceToStop}</p><p className="stat-value">{formatDistance(distance)}</p></div>
                  </div>
                  {liveETA && (
                    <div className="tracking-stat">
                      <span className="material-symbols-outlined">schedule</span>
                      <div><p className="stat-label">{t.liveETA}</p><p className="stat-value">{liveETA}</p></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {assignedPartner && (
            <div className="delivery-partner-info">
              <h3 className="tracking-section-title">{t.yourPartner}</h3>
              <div className="partner-card">
                <div className="partner-header">
                  <div className="partner-avatar"><span className="material-symbols-outlined">person</span></div>
                  <div className="partner-details">
                    <h3>{assignedPartner.name}</h3>
                    <p>{language==='ml'?'ഡെലിവറി പാർട്ണർ':'Delivery Partner'}</p>
                    <p className="partner-vehicle">{assignedPartner.vehicleType||'Bike'}</p>
                  </div>
                  <div className="partner-status online">
                    <span className="material-symbols-outlined">wifi</span>
                    <span>{language==='ml'?'ഓൺലൈൻ':'Online'}</span>
                  </div>
                </div>
                <div className="partner-actions">
                  <button onClick={() => assignedPartner.phone && window.open(`tel:${assignedPartner.phone}`)} className="partner-call-button">
                    <span className="material-symbols-outlined">call</span>{t.callPartner}
                  </button>
                  <div className="partner-location">
                    <span className="material-symbols-outlined">location_on</span>
                    <span>{t.waitingAt} {stopName}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLocationEnabled && (
            <div className="tracking-map-section">
              <h3 className="tracking-section-title">{t.liveLocation}</h3>
              <div className="tracking-map-container">
                <LiveMap height="300px" userLocation={userLocation} busLocation={busLocation}
                  busStopLocation={getBusStopCoordinates(stopName)} deliveryPartnerLocation={deliveryPartnerLocation}
                  routePath={routePath} className="tracking-live-map" />
                <div className="tracking-map-legend">
                  <h4>{t.trackingInfo}</h4>
                  <div className="tracking-legend-items">
                    <div className="legend-item"><div className="legend-color" style={{ backgroundColor:'#4CAF50' }}></div><span>{t.yourLocation}{userLocation?' (Live)':''}</span></div>
                    {busLocation && <div className="legend-item"><div className="legend-color" style={{ backgroundColor:'#2196F3' }}></div><span>{t.busLocation}</span></div>}
                    <div className="legend-item"><div className="legend-color" style={{ backgroundColor:'#FF9800' }}></div><span>{t.deliveryStopLegend}</span></div>
                    {deliveryPartnerLocation && <div className="legend-item"><div className="legend-color" style={{ backgroundColor:'#9C27B0' }}></div><span>{t.partnerLegend}</span></div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {orderStatus !== 'handover' && (
            <div className="tracking-countdown-section">
              <p className="tracking-countdown-label">{t.arrivalCountdown}:</p>
              <div className="tracking-timer-container">
                <div className="tracking-timer-item">
                  <div className="tracking-timer-box"><p className="tracking-timer-value">{String(timeRemaining.minutes).padStart(2,'0')}</p></div>
                  <p className="tracking-timer-text">{t.minutes}</p>
                </div>
                <div className="tracking-timer-item">
                  <div className="tracking-timer-box"><p className="tracking-timer-value">{String(timeRemaining.seconds).padStart(2,'0')}</p></div>
                  <p className="tracking-timer-text">{t.seconds}</p>
                </div>
              </div>
            </div>
          )}

          <div className="tracking-details-section">
            <h3 className="tracking-section-title">{t.orderDetails}</h3>
            <div className="tracking-details-card">
              <div className="tracking-detail-row"><p className="tracking-detail-label">{t.orderId}</p><p className="tracking-detail-value">#{shortOrderId}</p></div>
              {shortPaymentId && <div className="tracking-detail-row"><p className="tracking-detail-label">{t.paymentId}</p><p className="tracking-detail-value">{shortPaymentId}</p></div>}
              <div className="tracking-detail-row">
                <p className="tracking-detail-label">{t.items}</p>
                <p className="tracking-detail-value">{orderData?.cartItems?.length ? orderData.cartItems.map(i=>`${i.name} ×${i.quantity}`).join(', ') : '—'}</p>
              </div>
              <div className="tracking-detail-row"><p className="tracking-detail-label">{t.total}</p><p className="tracking-detail-value" style={{ color:'#68f91a', fontWeight:700 }}>₹{orderData?.amount||'—'}</p></div>
              <div className="tracking-detail-row"><p className="tracking-detail-label">{t.paymentMethod}</p><p className="tracking-detail-value">{methodLabel}</p></div>
            </div>
          </div>

          <div className="tracking-delivery-section">
            <h3 className="tracking-section-title">{t.delivery}</h3>
            <div className="tracking-delivery-card">
              <div className="tracking-detail-row"><p className="tracking-detail-label">{t.deliveryLocation}</p><p className="tracking-detail-value">{stopName}</p></div>
            </div>
          </div>
        </main>
      </div>

      <footer className="tracking-footer-nav">
        <div className="tracking-nav-container">
          {[
            { to:'/yathrika-home', icon:'home',         label:t.home,          active:false },
            { to:'/order-history', icon:'receipt_long', label:t.orders,        active:true  },
            { to:'/user-profile',  icon:'person',       label:t.profile,       active:false },
            { to:'/notifications', icon:'notifications',label:t.notifications, active:false },
          ].map(item => (
            <Link key={item.to} className={`tracking-nav-item${item.active?' tracking-nav-active':''}`} to={item.to}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="tracking-nav-text">{item.label}</span>
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
};

const S = {
  page:    { minHeight:'100vh', backgroundColor:'#16230f', fontFamily:"'Space Grotesk', sans-serif", display:'flex', flexDirection:'column' },
  hdr:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid rgba(104,249,26,0.08)' },
  centre:  { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px' },
  ring:    { width:110, height:110, borderRadius:'50%', border:'2px solid rgba(104,249,26,0.25)', display:'flex', alignItems:'center', justifyContent:'center', animation:'ripple 2s ease-out infinite' },
  ringIn:  { width:76, height:76, borderRadius:'50%', backgroundColor:'rgba(104,249,26,0.09)', display:'flex', alignItems:'center', justifyContent:'center' },
  cancelBox:{ display:'flex', alignItems:'center', gap:8, backgroundColor:'rgba(255,184,77,0.1)', border:'1px solid rgba(255,184,77,0.3)', borderRadius:12, padding:'10px 18px', marginBottom:22 },
  miniCard:{ width:'100%', maxWidth:340, backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(104,249,26,0.12)', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:10, marginBottom:28 },
  miniRow: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  mL:      { color:'#666', fontSize:'0.78rem' },
  mV:      { color:'#fff', fontSize:'0.83rem', fontWeight:600 },
  btn:     { backgroundColor:'#68f91a', color:'#16230f', border:'none', borderRadius:14, padding:'14px 36px', fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:"'Space Grotesk', sans-serif" },
};

export default Tracking;