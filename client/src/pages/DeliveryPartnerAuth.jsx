import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import '../index.css';

// ─── Kerala bus stops (same list as Routes.jsx) ───────────────────────────────
const KERALA_BUS_STOPS = [
  { id:1,  name:'Kollam Bus Stand',          lat:8.8932,  lng:76.6141, city:'Kollam'        },
  { id:2,  name:'Kadavoor Junction',          lat:8.9301,  lng:76.6423, city:'Kollam'        },
  { id:3,  name:'Paravur Bus Stop',           lat:8.7876,  lng:76.6803, city:'Kollam'        },
  { id:4,  name:'Karunagappally Stop',        lat:9.0612,  lng:76.5349, city:'Kollam'        },
  { id:5,  name:'Ernakulam KSRTC',            lat:9.9816,  lng:76.2999, city:'Ernakulam'     },
  { id:6,  name:'Aluva Bus Stand',            lat:10.1004, lng:76.3570, city:'Ernakulam'     },
  { id:7,  name:'Vyttila Mobility Hub',       lat:9.9602,  lng:76.3201, city:'Ernakulam'     },
  { id:8,  name:'Kakkanad Junction',          lat:10.0161, lng:76.3508, city:'Ernakulam'     },
  { id:9,  name:'Thrissur Round',             lat:10.5276, lng:76.2144, city:'Thrissur'      },
  { id:10, name:'Palakkad Bus Stand',         lat:10.7867, lng:76.6548, city:'Palakkad'      },
  { id:11, name:'Kozhikode KSRTC',            lat:11.2588, lng:75.7804, city:'Kozhikode'     },
  { id:12, name:'Thiruvananthapuram Central', lat:8.4855,  lng:76.9492, city:'Trivandrum'    },
  { id:13, name:'Attingal Bus Stop',          lat:8.6951,  lng:76.8149, city:'Trivandrum'    },
  { id:14, name:'Kottayam Bus Stand',         lat:9.5916,  lng:76.5222, city:'Kottayam'      },
  { id:15, name:'Alappuzha Bus Stand',        lat:9.4981,  lng:76.3388, city:'Alappuzha'     },
  { id:16, name:'Kannur Bus Stand',           lat:11.8745, lng:75.3704, city:'Kannur'        },
  { id:17, name:'Kasaragod Bus Stand',        lat:12.4996, lng:74.9869, city:'Kasaragod'     },
  { id:18, name:'Manjeri Bus Stand',          lat:11.1201, lng:76.1194, city:'Malappuram'    },
  { id:19, name:'Tirur Bus Stop',             lat:10.9121, lng:75.9228, city:'Malappuram'    },
  { id:20, name:'Pathanamthitta Bus Stand',   lat:9.2648,  lng:76.7870, city:'Pathanamthitta'},
];

const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};
const fmtDist = (km) => km < 1 ? `${Math.round(km*1000)}m away` : `${km.toFixed(1)}km away`;

// ─── Pending approval screen ──────────────────────────────────────────────────
export const DeliveryPartnerPending = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('deliveryPartner')); } catch { return null; }
  });
  const [statusMsg, setStatusMsg] = React.useState('');

  // Real-time approval via socket + fallback HTTP poll every 10s
  React.useEffect(() => {
    if (!partner?._id) return;

    socketService.connect();
    socketService.watchApproval(partner._id);

    // Socket-based instant update
    socketService.onApprovalStatusChanged((data) => {
      if (data.partnerId !== partner._id) return;
      const latest = data.partner || { ...partner, approvalStatus: data.approvalStatus, rejectReason: data.rejectReason };
      localStorage.setItem('deliveryPartner', JSON.stringify(latest));
      setPartner(latest);
      if (data.approvalStatus === 'approved') {
        setStatusMsg('✅ Approved! Redirecting to your dashboard…');
        setTimeout(() => navigate('/delivery-partner-dashboard'), 1500);
      } else if (data.approvalStatus === 'rejected') {
        setStatusMsg('❌ Application rejected. ' + (data.rejectReason ? 'Reason: ' + data.rejectReason : 'Please contact admin.'));
      }
    });

    // HTTP fallback poll every 10s (in case socket misses)
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/delivery-partner/${partner._id}/status`);
        if (!res.ok) return;
        const data = await res.json();
        localStorage.setItem('deliveryPartner', JSON.stringify(data.partner));
        setPartner(data.partner);
        if (data.approvalStatus === 'approved') {
          setStatusMsg('✅ Approved! Redirecting to your dashboard…');
          clearInterval(interval);
          setTimeout(() => navigate('/delivery-partner-dashboard'), 1500);
        } else if (data.approvalStatus === 'rejected') {
          setStatusMsg('❌ Application rejected. ' + (data.rejectReason ? 'Reason: ' + data.rejectReason : 'Please contact admin.'));
          clearInterval(interval);
        }
      } catch (_) {}
    }, 10000);

    return () => {
      clearInterval(interval);
      socketService.removeAllListeners();
    };
  }, [navigate, partner?._id]);

  const isRejected = partner?.approvalStatus === 'rejected';

  return (
    <div style={S.page}>
      <div style={S.centreCard}>
        <div style={S.iconCircle}>{isRejected ? '\u274c' : '\u23f3'}</div>
        <h2 style={S.h2}>{isRejected ? 'Application Rejected' : 'Application Under Review'}</h2>
        <p style={S.subtext}>
          Hi <strong style={{ color:'#fff' }}>{partner?.name || 'there'}</strong>,{' '}
          {isRejected
            ? 'your application was not approved at this time.'
            : 'your delivery partner application has been submitted successfully.'}
        </p>
        {statusMsg ? (
          <p style={{ ...S.subtext, color: isRejected ? '#ff5555' : '#68f91a', fontWeight: 700 }}>{statusMsg}</p>
        ) : (
          <p style={S.subtext}>
            Our admin team will review your details and approve your account shortly.
            You'll be able to access your dashboard once approved.
          </p>
        )}
        <div style={S.infoBox}>
          <div style={S.infoRow}><span style={S.infoLabel}>Assigned Stop</span><span style={S.infoVal}>{partner?.assignedBusStop || '\u2014'}</span></div>
          <div style={S.infoRow}><span style={S.infoLabel}>Vehicle</span><span style={S.infoVal}>{partner?.vehicleType || '\u2014'}</span></div>
          <div style={S.infoRow}>
            <span style={S.infoLabel}>Status</span>
            <span style={{ ...S.infoVal, color: isRejected ? '#ff5555' : '#ffb84d', fontWeight:700 }}>
              {isRejected ? 'Rejected' : 'Pending Approval'}
            </span>
          </div>
          {isRejected && partner?.rejectReason && (
            <div style={S.infoRow}><span style={S.infoLabel}>Reason</span><span style={{ ...S.infoVal, color:'#ff5555' }}>{partner.rejectReason}</span></div>
          )}
        </div>
        {!isRejected && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
            <div style={S.pulsingDot} />
            <span style={{ color:'#888', fontSize:'0.78rem' }}>Checking for updates automatically\u2026</span>
          </div>
        )}
        <button style={S.ghostBtn} onClick={() => { localStorage.removeItem('deliveryPartner'); navigate('/delivery-partner-auth'); }}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

// ─── Main Auth component ──────────────────────────────────────────────────────
const DeliveryPartnerAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin]   = useState(true);
  const [formData, setFormData] = useState({
    name:'', email:'', phone:'', password:'', confirmPassword:'',
    licenseNumber:'', vehicleType:'Bike',
    busStop:'', busStopLat:null, busStopLng:null,
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // ── Stop picker state ─────────────────────────────────────────────────────────
  const [locPhase,     setLocPhase]     = useState('idle'); // idle | loading | done | error
  const [nearbyStops,  setNearbyStops]  = useState([]);
  const [allStops,     setAllStops]     = useState(KERALA_BUS_STOPS);
  const [stopSearch,   setStopSearch]   = useState('');
  const [showAll,      setShowAll]      = useState(false);

  const requestGeo = () => {
    setLocPhase('loading');
    if (!navigator.geolocation) { setLocPhase('error'); setNearbyStops(KERALA_BUS_STOPS); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        const sorted = KERALA_BUS_STOPS
          .map(s => ({ ...s, distance: haversine(lat, lng, s.lat, s.lng) }))
          .sort((a, b) => a.distance - b.distance);
        setAllStops(sorted);
        setNearbyStops(sorted.slice(0, 6));
        setLocPhase('done');
      },
      () => { setLocPhase('error'); setNearbyStops(KERALA_BUS_STOPS.slice(0, 8)); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const displayedStops = stopSearch.trim()
    ? allStops.filter(s => s.name.toLowerCase().includes(stopSearch.toLowerCase()) || s.city.toLowerCase().includes(stopSearch.toLowerCase()))
    : showAll ? allStops : nearbyStops;

  const pickStop = (stop) => {
    setFormData(p => ({ ...p, busStop: stop.name, busStopLat: stop.lat, busStopLng: stop.lng }));
    setStopSearch('');
  };

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login via API
        const response = await fetch('/api/delivery-partner/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        // Store partner data and token
        localStorage.setItem('deliveryPartner', JSON.stringify(data.partner));
        localStorage.setItem('deliveryPartnerToken', data.token);

        // Check approval status
        if (data.partner.approvalStatus === 'rejected') {
          setError(`Application rejected. Reason: ${data.partner.rejectReason || 'Contact admin.'}`);
          return;
        }
        if (data.partner.approvalStatus !== 'approved') {
          navigate('/delivery-partner-pending');
          return;
        }

        // Successfully logged in and approved
        navigate('/delivery-partner-dashboard');

      } else {
        // Registration validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        if (!formData.name || !formData.email || !formData.phone || !formData.licenseNumber) {
          setError('Please fill all required fields.');
          return;
        }
        if (!formData.busStop) {
          setError('Please select a bus stop.');
          return;
        }

        // Register via API
        const response = await fetch('/api/delivery-partner/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            assignedBusStop: formData.busStop,
            assignedBusStopCoords: {
              lat: formData.busStopLat,
              lng: formData.busStopLng
            },
            licenseNumber: formData.licenseNumber,
            vehicleType: formData.vehicleType
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        // Store partner data and token
        localStorage.setItem('deliveryPartner', JSON.stringify(data.partner));
        localStorage.setItem('deliveryPartnerToken', data.token);
        
        // Navigate to pending approval page
        navigate('/delivery-partner-pending');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-auth-container">
      <div className="partner-auth-wrapper">

        <header className="partner-auth-header">
          <Link to="/user-type-selection" className="partner-auth-back-button">
            <i className="material-icons">arrow_back</i>
          </Link>
          <h1 className="partner-auth-title">Delivery Partner</h1>
          <div className="partner-auth-header-spacer"></div>
        </header>

        <main className="partner-auth-main">
          <div className="partner-auth-card">

            {/* Toggle */}
            <div className="partner-auth-toggle">
              <button onClick={() => setIsLogin(true)}  className={`partner-auth-toggle-button ${isLogin  ? 'active':''}`}>Login</button>
              <button onClick={() => setIsLogin(false)} className={`partner-auth-toggle-button ${!isLogin ? 'active':''}`}>Register</button>
            </div>

            <form onSubmit={handleSubmit} className="partner-auth-form">
              {error && (
                <div className="partner-auth-error">
                  <i className="material-icons">error</i><span>{error}</span>
                </div>
              )}

              {/* ── REGISTER-ONLY FIELDS ── */}
              {!isLogin && (<>

                <div className="partner-auth-field">
                  <label>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" />
                </div>

                <div className="partner-auth-field">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 9876543210" />
                </div>

                {/* ── Geo-powered bus stop picker ── */}
                <div className="partner-auth-field">
                  <label>Assigned Bus Stop *</label>

                  {formData.busStop ? (
                    /* Selected confirmation chip */
                    <div style={P.selectedChip}>
                      <div style={{ flex:1 }}>
                        <p style={{ color:'#fff', fontWeight:700, margin:0, fontSize:'0.9rem' }}>{formData.busStop}</p>
                        <p style={{ color:'#68f91a', margin:0, fontSize:'0.72rem', fontWeight:600 }}>✓ Selected</p>
                      </div>
                      <button type="button" style={P.changeBtn} onClick={() => setFormData(p => ({ ...p, busStop:'', busStopLat:null, busStopLng:null }))}>
                        Change
                      </button>
                    </div>
                  ) : (
                    <div style={P.pickerBox}>

                      {/* Location button / status */}
                      {locPhase === 'idle' && (
                        <button type="button" style={P.geoBtn} onClick={requestGeo}>
                          <i className="material-icons" style={{ fontSize:18 }}>my_location</i>
                          Suggest stops near me
                        </button>
                      )}
                      {locPhase === 'loading' && (
                        <div style={P.geoStatus}>
                          <i className="material-icons" style={{ color:'#68f91a', fontSize:18 }}>gps_fixed</i>
                          <span style={{ color:'#888', fontSize:'0.82rem' }}>Getting your location…</span>
                        </div>
                      )}
                      {locPhase === 'done' && (
                        <div style={P.geoStatus}>
                          <i className="material-icons" style={{ color:'#68f91a', fontSize:16 }}>check_circle</i>
                          <span style={{ color:'#68f91a', fontSize:'0.8rem', fontWeight:600 }}>Sorted by distance from you</span>
                        </div>
                      )}
                      {locPhase === 'error' && (
                        <p style={{ color:'#ffb84d', fontSize:'0.78rem', margin:0 }}>⚠️ Location unavailable — showing all stops</p>
                      )}

                      {/* Search */}
                      <div style={P.searchBox}>
                        <i className="material-icons" style={{ color:'#555', fontSize:18 }}>search</i>
                        <input
                          type="text"
                          placeholder="Search stops or city…"
                          value={stopSearch}
                          onChange={e => setStopSearch(e.target.value)}
                          style={P.searchInput}
                        />
                        {stopSearch && (
                          <button type="button" onClick={() => setStopSearch('')} style={{ background:'none', border:'none', color:'#555', cursor:'pointer', padding:0, display:'flex' }}>
                            <i className="material-icons" style={{ fontSize:16 }}>close</i>
                          </button>
                        )}
                      </div>

                      {/* Section label */}
                      <p style={P.sectionLabel}>
                        {stopSearch ? `${displayedStops.length} result${displayedStops.length !== 1 ? 's' : ''}`
                          : locPhase === 'done' ? '📍 Nearest stops'
                          : '🚏 All stops'}
                      </p>

                      {/* Stop list */}
                      <div style={P.stopList}>
                        {displayedStops.length === 0 ? (
                          <p style={{ color:'#555', fontSize:'0.82rem', textAlign:'center', padding:12 }}>No stops found</p>
                        ) : displayedStops.map(stop => (
                          <button key={stop.id} type="button" style={P.stopRow} onClick={() => pickStop(stop)}>
                            <div style={P.stopIcon}>
                              <i className="material-icons" style={{ fontSize:18, color:'#68f91a' }}>directions_bus</i>
                            </div>
                            <div style={{ flex:1, textAlign:'left' }}>
                              <p style={{ color:'#fff', fontWeight:600, margin:0, fontSize:'0.85rem', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{stop.name}</p>
                              <p style={{ color:'#888', margin:0, fontSize:'0.72rem' }}>
                                {stop.city}
                                {stop.distance !== undefined && (
                                  <span style={{ color:'#68f91a', fontWeight:700, marginLeft:6 }}>{fmtDist(stop.distance)}</span>
                                )}
                              </p>
                            </div>
                            <i className="material-icons" style={{ color:'#444', fontSize:18, flexShrink:0 }}>chevron_right</i>
                          </button>
                        ))}
                      </div>

                      {/* Show all toggle */}
                      {(locPhase === 'done' || locPhase === 'idle') && !stopSearch && !showAll && (
                        <button type="button" style={P.showAllBtn} onClick={() => setShowAll(true)}>
                          Show all {KERALA_BUS_STOPS.length} stops →
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="partner-auth-field">
                  <label>License Number *</label>
                  <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required placeholder="KL01-2024-0001234" />
                </div>

                <div className="partner-auth-field">
                  <label>Vehicle Type *</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>

              </>)}

              {/* ── COMMON FIELDS ── */}
              <div className="partner-auth-field">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="partner@example.com" />
              </div>
              <div className="partner-auth-field">
                <label>Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter password" />
              </div>
              {!isLogin && (
                <div className="partner-auth-field">
                  <label>Confirm Password *</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm password" />
                </div>
              )}

              <button type="submit" className="partner-auth-submit" disabled={loading}>
                {loading ? 'Processing…' : isLogin ? 'Login' : 'Submit Application'}
              </button>
            </form>

            {/* Benefits */}
            <div className="partner-auth-info">
              <h3>Benefits of Being a Delivery Partner</h3>
              <div className="partner-benefits">
                {[
                  { icon:'local_atm',   text:'Earn flexible income'                },
                  { icon:'schedule',    text:'Choose your own hours'               },
                  { icon:'location_on', text:'Work near your preferred bus stop'   },
                  { icon:'phone',       text:'Direct communication with customers' },
                ].map(b => (
                  <div key={b.icon} className="benefit-item">
                    <i className="material-icons">{b.icon}</i>
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

// ─── Pending screen styles ────────────────────────────────────────────────────
const S = {
  page:      { minHeight:'100vh', backgroundColor:'#16230f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Grotesk',sans-serif", padding:24 },
  centreCard:{ maxWidth:400, width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(104,249,26,0.15)', borderRadius:20, padding:'40px 28px', display:'flex', flexDirection:'column', alignItems:'center', gap:14, textAlign:'center' },
  iconCircle:{ fontSize:52, marginBottom:4 },
  h2:        { color:'#fff', fontWeight:800, margin:0, fontSize:'1.35rem' },
  subtext:   { color:'#888', fontSize:'0.88rem', lineHeight:1.65, margin:0 },
  infoBox:   { width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(104,249,26,0.1)', borderRadius:14, padding:'14px 16px', display:'flex', flexDirection:'column', gap:10, marginTop:4 },
  infoRow:   { display:'flex', justifyContent:'space-between', alignItems:'center' },
  infoLabel: { color:'#555', fontSize:'0.78rem' },
  infoVal:   { color:'#fff', fontSize:'0.82rem', fontWeight:600 },
  ghostBtn:  { background:'none', border:'none', color:'#68f91a', fontSize:'0.85rem', cursor:'pointer', textDecoration:'underline', fontFamily:"'Space Grotesk',sans-serif", marginTop:4 },
  pulsingDot: { width:8, height:8, borderRadius:'50%', backgroundColor:'#ffb84d', animation:'pulse 1.5s ease-in-out infinite', flexShrink:0 },
};

// ─── Stop picker inline styles ────────────────────────────────────────────────
const P = {
  selectedChip: { display:'flex', alignItems:'center', gap:12, backgroundColor:'rgba(104,249,26,0.08)', border:'1px solid rgba(104,249,26,0.25)', borderRadius:12, padding:'12px 14px' },
  changeBtn:    { background:'none', border:'none', color:'#68f91a', fontSize:'0.78rem', cursor:'pointer', textDecoration:'underline', fontFamily:"'Space Grotesk',sans-serif", flexShrink:0 },
  pickerBox:    { display:'flex', flexDirection:'column', gap:8 },
  geoBtn:       { display:'flex', alignItems:'center', gap:8, backgroundColor:'rgba(104,249,26,0.1)', border:'1px solid rgba(104,249,26,0.3)', borderRadius:10, padding:'10px 14px', color:'#68f91a', fontSize:'0.85rem', fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" },
  geoStatus:    { display:'flex', alignItems:'center', gap:8, padding:'4px 0' },
  searchBox:    { display:'flex', alignItems:'center', gap:6, backgroundColor:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 12px' },
  searchInput:  { flex:1, background:'none', border:'none', outline:'none', color:'#fff', fontSize:'0.85rem', fontFamily:"'Space Grotesk',sans-serif" },
  sectionLabel: { color:'#555', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', margin:0 },
  stopList:     { display:'flex', flexDirection:'column', gap:4, maxHeight:230, overflowY:'auto' },
  stopRow:      { display:'flex', alignItems:'center', gap:10, backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(104,249,26,0.08)', borderRadius:10, padding:'10px 12px', cursor:'pointer', width:'100%', transition:'border-color 0.15s' },
  stopIcon:     { width:32, height:32, borderRadius:8, backgroundColor:'rgba(104,249,26,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  showAllBtn:   { background:'none', border:'none', color:'#68f91a', fontSize:'0.78rem', cursor:'pointer', textDecoration:'underline', fontFamily:"'Space Grotesk',sans-serif", alignSelf:'flex-start' },
};

export default DeliveryPartnerAuth;