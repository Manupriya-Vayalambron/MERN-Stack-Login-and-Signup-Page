import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt    = (n) => typeof n === 'number' ? n.toLocaleString('en-IN') : '0';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';

// API helper functions
const withAdminAuth = (token, extra = {}) => ({
  ...extra,
  headers: {
    ...(extra.headers || {}),
    Authorization: `Bearer ${token}`,
  },
});

const adminLogin = async (password) => {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Admin login failed');
  return data;
};

const adminLogout = async (token) => {
  if (!token) return;
  await fetch('/api/admin/logout', withAdminAuth(token, { method: 'POST' })).catch(() => {});
};

const fetchAllPartners = async (token) => {
  const response = await fetch('/api/admin/delivery-partners', withAdminAuth(token));
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || `Admin API error ${response.status}`);
  }
  return response.json();
};

const fetchAdminOverview = async (token) => {
  const response = await fetch('/api/admin/overview', withAdminAuth(token));
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || `Admin API error ${response.status}`);
  }
  return response.json();
};

const approvePartner = async (id, token) => {
  const response = await fetch(`/api/admin/delivery-partners/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || `Admin API error ${response.status}`);
  }
  return response.json();
};

const rejectPartner = async (id, rejectReason, token) => {
  const response = await fetch(`/api/admin/delivery-partners/${id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rejectReason })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || `Admin API error ${response.status}`);
  }
  return response.json();
};

const updateRefundStatus = async (orderId, refundStatus, token) => {
  const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/refund-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ refundStatus }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || `Admin API error ${response.status}`);
  }
  return response.json();
};

const creditPartnerWithProof = async ({ partnerId, amount, note, paidToPhone, paymentProofFile, token }) => {
  const form = new FormData();
  form.append('amount', String(amount));
  form.append('note', note || '');
  form.append('paidToPhone', paidToPhone || '');
  form.append('paymentProof', paymentProofFile);

  const response = await fetch(`/api/admin/delivery-partners/${partnerId}/credit-proof`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || `Admin API error ${response.status}`);
  }
  return response.json();
};

const statusColor = (status) => {
  if (status === 'success') return '#4CAF50';
  if (status === 'failed') return '#ff5555';
  return '#ffb84d';
};

const orderStatusColor = (status) => {
  if (status === 'handover') return '#4CAF50';
  if (status === 'cancelled') return '#ff5555';
  return '#4da6ff';
};

// ─── Sub-component: Partner detail/credit modal ────────────────────────────────
const PartnerModal = ({ partner, adminToken, onClose, onUpdate }) => {
  const [creditAmt,  setCreditAmt]  = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [paidToPhone, setPaidToPhone] = useState(partner?.phone || '');
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [isCrediting, setIsCrediting] = useState(false);
  const [msg,        setMsg]        = useState('');

  useEffect(() => {
    setPaidToPhone(partner?.phone || '');
    setPaymentProofFile(null);
  }, [partner?._id, partner?.phone]);

  const handleCredit = async () => {
    const amount = parseFloat(creditAmt);
    if (!amount || amount <= 0) { setMsg('Enter a valid amount'); return; }
    if (!paidToPhone.trim()) { setMsg('Enter the paid-to phone number'); return; }
    if (!paymentProofFile) { setMsg('Upload UPI payment screenshot'); return; }

    try {
      setIsCrediting(true);
      const result = await creditPartnerWithProof({
        partnerId: partner._id,
        amount,
        note: creditNote.trim(),
        paidToPhone: paidToPhone.trim(),
        paymentProofFile,
        token: adminToken,
      });

      onUpdate(result.partner);
      setCreditAmt('');
      setCreditNote('');
      setPaymentProofFile(null);
      setMsg(`✓ ₹${fmt(amount)} credited after proof verification`);
      setTimeout(() => setMsg(''), 3500);
    } catch (error) {
      setMsg(error.message || 'Failed to credit partner with proof');
    } finally {
      setIsCrediting(false);
    }
  };

  const lastCredit = partner.creditHistory?.slice(-1)[0] || null;

  return (
    <div style={M.overlay} onClick={onClose}>
      <div style={M.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={M.modalHeader}>
          <div>
            <h2 style={M.modalName}>{partner.name}</h2>
            <p style={M.modalSub}>{partner.assignedBusStop} · {partner.vehicleType}</p>
          </div>
          <button style={M.closeBtn} onClick={onClose}>
            <i className="material-icons">close</i>
          </button>
        </div>

        <div style={M.body}>
          {/* Contact */}
          <div style={M.row}><span style={M.lbl}>Email</span><span style={M.val}>{partner.email}</span></div>
          <div style={M.row}><span style={M.lbl}>Phone</span><span style={M.val}>{partner.phone}</span></div>
          <div style={M.row}><span style={M.lbl}>License</span><span style={M.val}>{partner.licenseNumber}</span></div>
          <div style={M.row}>
            <span style={M.lbl}>Aadhaar Proof</span>
            <span style={M.val}>
              {partner.aadharCardImageUrl
                ? <a href={partner.aadharCardImageUrl} target="_blank" rel="noreferrer" style={{ color:'#68f91a', textDecoration:'underline' }}>View Uploaded Proof</a>
                : 'Not uploaded'}
            </span>
          </div>
          <div style={M.row}><span style={M.lbl}>Joined</span><span style={M.val}>{fmtDate(partner.joinedDate)}</span></div>
          <div style={M.row}><span style={M.lbl}>Rating</span><span style={M.val}>{'⭐'.repeat(Math.round(partner.rating || 5))} {(partner.rating||5).toFixed(1)}</span></div>

          <div style={M.divider} />

          {/* Earnings stats */}
          <p style={M.sectionHead}>Earnings Overview</p>
          <div style={M.statsGrid}>
            {[
              { label:'Orders Done',    value: fmt(partner.completedOrders),  color:'#2196F3' },
              { label:'Total Earned',   value:`₹${fmt(partner.totalEarnings)}`,color:'#68f91a' },
              { label:'Pending Payout', value:`₹${fmt(partner.pendingEarnings)}`,color:'#ffb84d' },
              { label:'Total Credited', value:`₹${fmt(partner.totalCredited)}`, color:'#4CAF50' },
            ].map(s => (
              <div key={s.label} style={M.statBox}>
                <p style={{ ...M.statVal, color:s.color }}>{s.value}</p>
                <p style={M.statLbl}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Last credit */}
          {lastCredit && (
            <div style={M.lastCreditBox}>
              <i className="material-icons" style={{ color:'#4CAF50', fontSize:16 }}>check_circle</i>
              <span style={{ color:'#aaa', fontSize:'0.82rem' }}>
                Last credit: <strong style={{ color:'#4CAF50' }}>₹{fmt(lastCredit.amount)}</strong>
                {' '}on {fmtDate(lastCredit.creditedAt)}
                {lastCredit.note && <em style={{ color:'#666' }}> — {lastCredit.note}</em>}
                {lastCredit.paymentProofImageUrl && (
                  <>
                    {' '}· <a href={lastCredit.paymentProofImageUrl} target="_blank" rel="noreferrer" style={{ color:'#68f91a', textDecoration:'underline' }}>proof</a>
                  </>
                )}
              </span>
            </div>
          )}

          {/* Credit history */}
          {partner.creditHistory?.length > 0 && (
            <details style={{ marginTop:8 }}>
              <summary style={{ color:'#68f91a', fontSize:'0.78rem', cursor:'pointer', fontWeight:600 }}>
                Credit history ({partner.creditHistory.length})
              </summary>
              <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:6 }}>
                {[...partner.creditHistory].reverse().map((c, i) => (
                  <div key={i} style={M.histRow}>
                    <span style={{ color:'#4CAF50', fontWeight:700, fontSize:'0.82rem', flexShrink:0 }}>+₹{fmt(c.amount)}</span>
                    <span style={{ color:'#888', fontSize:'0.78rem', flex:1 }}>
                      {c.note || '—'}
                      {c.paidToPhone ? ` · Paid to: ${c.paidToPhone}` : ''}
                    </span>
                    {c.paymentProofImageUrl ? (
                      <a href={c.paymentProofImageUrl} target="_blank" rel="noreferrer" style={{ color:'#68f91a', fontSize:'0.72rem', textDecoration:'underline', marginRight:8, flexShrink:0 }}>
                        Proof
                      </a>
                    ) : null}
                    <span style={{ color:'#555', fontSize:'0.72rem', flexShrink:0 }}>{fmtDate(c.creditedAt)}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Completed order proof history */}
          {partner.completedOrderLog?.length > 0 && (
            <details style={{ marginTop:8 }}>
              <summary style={{ color:'#4da6ff', fontSize:'0.78rem', cursor:'pointer', fontWeight:600 }}>
                Completed deliveries ({partner.completedOrderLog.length})
              </summary>
              <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:6 }}>
                {[...partner.completedOrderLog].reverse().slice(0, 20).map((entry, i) => (
                  <div key={`${entry.orderId}_${i}`} style={M.histRow}>
                    <span style={{ color:'#2196F3', fontWeight:700, fontSize:'0.78rem', flexShrink:0 }}>#{String(entry.orderId).slice(-6)}</span>
                    <span style={{ color:'#888', fontSize:'0.76rem', flex:1 }}>₹{fmt(entry.reward || 0)}</span>
                    {entry.handoverProofImageUrl ? (
                      <a href={entry.handoverProofImageUrl} target="_blank" rel="noreferrer" style={{ color:'#68f91a', fontSize:'0.72rem', textDecoration:'underline', flexShrink:0 }}>
                        Proof
                      </a>
                    ) : (
                      <span style={{ color:'#555', fontSize:'0.72rem', flexShrink:0 }}>No proof</span>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}

          <div style={M.divider} />

          {/* Credit form */}
          <p style={M.sectionHead}>Credit Earnings to Partner</p>
          {msg && <p style={{ color: msg.startsWith('✓') ? '#4CAF50' : '#ff5555', fontSize:'0.82rem', margin:'0 0 8px' }}>{msg}</p>}
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <div style={M.inputWrap}>
              <span style={{ color:'#68f91a', fontWeight:700, fontSize:'0.9rem' }}>₹</span>
              <input
                type="number"
                min="1"
                placeholder="Amount"
                value={creditAmt}
                onChange={e => setCreditAmt(e.target.value)}
                style={M.input}
              />
            </div>
            <input
              type="text"
              placeholder="Note (optional)"
              value={creditNote}
              onChange={e => setCreditNote(e.target.value)}
              style={{ ...M.input, flex:2, backgroundColor:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'0 12px', color:'#fff' }}
            />
          </div>
          <input
            type="text"
            placeholder="Paid-to phone"
            value={paidToPhone}
            onChange={e => setPaidToPhone(e.target.value)}
            style={{ ...M.input, width:'100%', backgroundColor:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'0 12px', color:'#fff', marginBottom:8 }}
          />
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={e => setPaymentProofFile(e.target.files?.[0] || null)}
            style={{ width:'100%', marginBottom:8, color:'#aaa', fontSize:'0.78rem' }}
          />
          <button style={M.creditBtn} onClick={handleCredit} disabled={isCrediting}>
            <i className="material-icons" style={{ fontSize:18 }}>payments</i>
            {isCrediting
              ? 'Verifying Proof...'
              : `Credit ₹${creditAmt || '0'} to ${partner.name.split(' ')[0]}`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Admin Component ─────────────────────────────────────────────────────
const Admin = () => {
  const [adminToken,   setAdminToken]   = useState(() => localStorage.getItem('yathrika_admin_token') || '');
  const [password,     setPassword]     = useState('');
  const [authError,    setAuthError]    = useState('');
  const [isAuthBusy,   setIsAuthBusy]   = useState(false);
  const [activeTab,    setActiveTab]    = useState('dashboard');  // dashboard | partners | pending | data
  const [partners,     setPartners]     = useState([]);
  const [orders,       setOrders]       = useState([]);
  const [users,        setUsers]        = useState([]);
  const [overview,     setOverview]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [selectedP,    setSelectedP]    = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQ,      setSearchQ]      = useState('');
  const [orderSearchQ, setOrderSearchQ] = useState('');
  const [updatingRefundFor, setUpdatingRefundFor] = useState('');

  const loadAdminData = async (tokenArg) => {
    const token = tokenArg || adminToken;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchAdminOverview(token);
      setOverview(data.overview || null);
      setPartners(data.partners || []);
      setUsers(data.users || []);
      setOrders(data.orders || []);
    } catch (error) {
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('authentication') || msg.includes('session expired') || msg.includes('401')) {
        localStorage.removeItem('yathrika_admin_token');
        setAdminToken('');
        setAuthError('Session expired. Please login again.');
        setPartners([]);
        setUsers([]);
        setOrders([]);
        setOverview(null);
        return;
      }
      console.error('Error loading admin overview:', error);
      try {
        const allPartners = await fetchAllPartners(token);
        setPartners(allPartners);
      } catch (partnersError) {
        console.error('Error loading partners fallback:', partnersError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) loadAdminData(adminToken);
    else setLoading(false);
  }, [adminToken]);

  const reload = async () => {
    await loadAdminData(adminToken);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const rawPassword = String(password || '');
    if (!rawPassword.trim()) {
      setAuthError('Password is required.');
      return;
    }
    if (/\s/.test(rawPassword)) {
      setAuthError('Password must not contain spaces.');
      return;
    }
    try {
      setIsAuthBusy(true);
      const data = await adminLogin(rawPassword);
      localStorage.setItem('yathrika_admin_token', data.token);
      setAdminToken(data.token);
      setPassword('');
    } catch (error) {
      setAuthError(error.message || 'Invalid admin password');
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleAdminLogout = async () => {
    await adminLogout(adminToken);
    localStorage.removeItem('yathrika_admin_token');
    setAdminToken('');
    setPartners([]);
    setUsers([]);
    setOrders([]);
    setOverview(null);
  };

  // Approve
  const handleApprovePartner = async (id) => {
    try {
      await approvePartner(id, adminToken);
      await reload(); // Refresh the list
      
      // Also update localStorage if partner is currently logged in
      const currentPartner = JSON.parse(localStorage.getItem('deliveryPartner') || 'null');
      if (currentPartner?._id === id) {
        const updatedPartners = await fetchAllPartners(adminToken);
        const updatedPartner = updatedPartners.find(p => p._id === id);
        if (updatedPartner) {
          localStorage.setItem('deliveryPartner', JSON.stringify(updatedPartner));
        }
      }
    } catch (error) {
      console.error('Error approving partner:', error);
      alert('Failed to approve partner. Please try again.');
    }
  };

  // Reject
  const handleRejectPartner = async (id) => {
    try {
      await rejectPartner(id, rejectReason, adminToken);
      await reload(); // Refresh the list
      setRejectTarget(null);
      setRejectReason('');
      
      // Also update localStorage if partner is currently logged in
      const currentPartner = JSON.parse(localStorage.getItem('deliveryPartner') || 'null');
      if (currentPartner?._id === id) {
        const updatedPartners = await fetchAllPartners(adminToken);
        const updatedPartner = updatedPartners.find(p => p._id === id);
        if (updatedPartner) {
          localStorage.setItem('deliveryPartner', JSON.stringify(updatedPartner));
        }
      }
    } catch (error) {
      console.error('Error rejecting partner:', error);
      alert('Failed to reject partner. Please try again.');
    }
  };

  // Update partner (from modal credit action)
  const updatePartner = async (updated) => {
    try {
      const next = partners.map(p => p._id === updated._id ? updated : p);
      setPartners(next);
      setSelectedP(updated);
      
      // Update localStorage if it's the currently logged in partner
      const currentPartner = JSON.parse(localStorage.getItem('deliveryPartner') || 'null');
      if (currentPartner?._id === updated._id) {
        localStorage.setItem('deliveryPartner', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error updating partner:', error);
    }
  };

  const handleMarkRefundCompleted = async (orderId) => {
    try {
      setUpdatingRefundFor(orderId);
      await updateRefundStatus(orderId, 'completed', adminToken);
      await reload();
    } catch (error) {
      console.error('Error updating refund status:', error);
      alert(error.message || 'Failed to update refund status. Please try again.');
    } finally {
      setUpdatingRefundFor('');
    }
  };

  // Computed
  const pending  = partners.filter(p => p.approvalStatus === 'pending');
  const approved = partners.filter(p => p.approvalStatus === 'approved');
  const rejected = partners.filter(p => p.approvalStatus === 'rejected');

  const filteredApproved = approved.filter(p =>
    !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.assignedBusStop.toLowerCase().includes(searchQ.toLowerCase())
  );

  const totalEarnings  = approved.reduce((s,p) => s+(p.totalEarnings||0), 0);
  const totalPending   = approved.reduce((s,p) => s+(p.pendingEarnings||0), 0);
  const totalCredited  = approved.reduce((s,p) => s+(p.totalCredited||0), 0);

  const summary = {
    totalUsers: overview?.totalUsers ?? users.length,
    verifiedUsers: overview?.verifiedUsers ?? users.filter(u => u.isVerified).length,
    totalOrders: overview?.totalOrders ?? orders.length,
    successOrders: overview?.successOrders ?? orders.filter(o => o.paymentStatus === 'success').length,
    failedOrders: overview?.failedOrders ?? orders.filter(o => o.paymentStatus === 'failed').length,
    pendingOrders: overview?.pendingOrders ?? orders.filter(o => o.paymentStatus === 'pending').length,
    refundRequests: overview?.refundRequests ?? orders.filter(o => o.orderStatus === 'cancelled' && o.refundStatus === 'pending').length,
    successRevenue: overview?.successRevenue ?? orders.filter(o => o.paymentStatus === 'success').reduce((s, o) => s + (o.totalAmount || 0), 0),
    pendingPoolCount: overview?.pendingPoolCount ?? 0,
  };

  const pendingPoolOrders = overview?.pendingPoolOrders || [];
  const refundRequestOrders = orders
    .filter((o) => o.orderStatus === 'cancelled' && o.refundStatus === 'pending')
    .sort((a, b) => new Date(b.cancelledAt || b.orderDate || 0) - new Date(a.cancelledAt || a.orderDate || 0));
  const recentOrders = orders.slice(0, 8);
  const filteredOrders = orders.filter(o => {
    if (!orderSearchQ.trim()) return true;
    const q = orderSearchQ.toLowerCase();
    return (
      String(o.orderId || '').toLowerCase().includes(q) ||
      String(o.userPhoneNumber || '').toLowerCase().includes(q) ||
      String(o.userName || '').toLowerCase().includes(q) ||
      String(o.paymentStatus || '').toLowerCase().includes(q) ||
      String(o.paymentId || '').toLowerCase().includes(q) ||
      String(o.orderStatus || '').toLowerCase().includes(q) ||
      String(o.refundStatus || '').toLowerCase().includes(q)
    );
  });

  if (!adminToken) {
    return (
      <div className="admin-page-container" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <form onSubmit={handleAdminLogin} style={{ width:'100%', maxWidth:420, backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(104,249,26,0.15)', borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:12 }}>
          <h2 style={{ margin:0, color:'#fff', fontSize:'1.15rem', fontWeight:800 }}>Admin Login</h2>
          <p style={{ margin:0, color:'#888', fontSize:'0.82rem' }}>Enter the admin password to access this page.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            style={{ backgroundColor:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'11px 12px', color:'#fff', outline:'none', fontSize:'0.9rem' }}
          />
          {authError && <p style={{ margin:0, color:'#ff5555', fontSize:'0.8rem' }}>{authError}</p>}
          <button type="submit" disabled={isAuthBusy} style={{ backgroundColor:'#68f91a', border:'none', borderRadius:10, padding:'11px 0', color:'#16230f', fontWeight:800, fontSize:'0.9rem', cursor:'pointer' }}>
            {isAuthBusy ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="admin-content-wrapper">

        {/* ── Header ── */}
        <header className="admin-header">
          <div className="admin-header-inner">
            <div className="admin-header-spacer"></div>
            <h1 className="admin-page-title">Yathrika Admin</h1>
            <div className="admin-settings-container">
              <button onClick={reload} className="admin-settings-button" title="Refresh data">
                <i className="material-icons" style={{ fontSize:22 }}>refresh</i>
              </button>
              <button onClick={handleAdminLogout} className="admin-settings-button" title="Logout admin" style={{ marginLeft:8 }}>
                <i className="material-icons" style={{ fontSize:22 }}>logout</i>
              </button>
            </div>
          </div>
        </header>

        {/* ── Tab bar ── */}
        <div style={A.tabBar}>
          {[
            { key:'dashboard', label:'Dashboard' },
            { key:'pending',   label:`Pending${pending.length ? ` (${pending.length})` : ''}` },
            { key:'partners',  label:'Partners' },
            { key:'data',      label:'Orders & Users' },
          ].map(tab => (
            <button key={tab.key} style={{ ...A.tab, ...(activeTab===tab.key ? A.tabActive : {}) }} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
              {tab.key === 'pending' && pending.length > 0 && (
                <span style={A.badge}>{pending.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ color:'#888', fontSize:'0.82rem', padding:'10px 16px 0' }}>Loading live admin data…</div>
        )}

        <main className="admin-main-content">

          {/* ══════════════════ DASHBOARD TAB ══════════════════ */}
          {activeTab === 'dashboard' && (<>

            {/* Summary cards */}
            <section style={A.statsSection}>
              <div style={A.statsGrid}>
                {[
                  { label:'Active Partners',  value: approved.length,       icon:'people',             color:'#2196F3' },
                  { label:'Total Orders',     value: fmt(summary.totalOrders), icon:'local_shipping',     color:'#68f91a' },
                  { label:'Revenue (Success)',value:`₹${fmt(summary.successRevenue)}`, icon:'account_balance_wallet', color:'#68f91a' },
                  { label:'Total Credited',   value:`₹${fmt(totalCredited)}`, icon:'payments',          color:'#4CAF50' },
                  { label:'Pending Payout',   value:`₹${fmt(totalPending)}`,  icon:'pending',           color:'#ffb84d' },
                  { label:'Pending Approval', value: pending.length,          icon:'hourglass_top',     color:'#ffb84d' },
                  { label:'Refund Requests',  value: summary.refundRequests,  icon:'currency_exchange',color:'#ff5555' },
                  { label:'Verified Users',   value: fmt(summary.verifiedUsers), icon:'verified_user',  color:'#4da6ff' },
                ].map(s => (
                  <div key={s.label} style={A.statCard}>
                    <i className="material-icons" style={{ color:s.color, fontSize:24 }}>{s.icon}</i>
                    <p style={{ ...A.statVal, color:s.color }}>{s.value}</p>
                    <p style={A.statLbl}>{s.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-live-orders-section">
              <h2 className="admin-section-title">Refund Requests ({refundRequestOrders.length})</h2>
              <div className="admin-orders-list">
                {refundRequestOrders.length === 0 ? (
                  <div style={A.emptyBox}>
                    <i className="material-icons" style={{ fontSize:36, color:'#444' }}>payments</i>
                    <p style={{ color:'#666', marginTop:8 }}>No refund requests pending</p>
                  </div>
                ) : refundRequestOrders.map(order => (
                  <div key={`${order.userPhoneNumber}_${order.orderId}_refund`} className="admin-order-card">
                    <div className="admin-order-details">
                      <div className="admin-order-info">
                        <p className="admin-order-number">Order #{order.orderId}</p>
                        <p className="admin-bus-stop">Payment ID: {order.paymentId || 'N/A'}</p>
                        <p className="admin-bus-stop">{order.userName || 'User'} · {order.userPhoneNumber}</p>
                        <p className="admin-bus-stop">Refund: {String(order.refundStatus || 'pending').toUpperCase()}</p>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                        <span style={{ ...A.pillRed, border:'1px solid rgba(255,85,85,0.35)' }}>CANCELLED</span>
                        <button
                          onClick={() => handleMarkRefundCompleted(order.orderId)}
                          disabled={updatingRefundFor === order.orderId}
                          style={{
                            border:'1px solid rgba(76,175,80,0.4)',
                            background:'rgba(76,175,80,0.15)',
                            color:'#9ef6a2',
                            borderRadius:8,
                            padding:'6px 10px',
                            fontSize:'0.72rem',
                            fontWeight:700,
                            cursor:updatingRefundFor === order.orderId ? 'default' : 'pointer',
                          }}
                        >
                          {updatingRefundFor === order.orderId ? 'Updating...' : 'Mark Refund Completed'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Live orders */}
            <section className="admin-live-orders-section">
              <h2 className="admin-section-title">Pending Partner Acceptance ({summary.pendingPoolCount})</h2>
              <div className="admin-orders-list">
                {pendingPoolOrders.length === 0 && (
                  <div style={A.emptyBox}>
                    <i className="material-icons" style={{ fontSize:36, color:'#444' }}>inbox</i>
                    <p style={{ color:'#666', marginTop:8 }}>No pending queue orders</p>
                  </div>
                )}
                {pendingPoolOrders.map(order => (
                  <div key={order.id} className="admin-order-card">
                    <div className="admin-order-details">
                      <div className="admin-order-info">
                        <p className="admin-order-number">Order #{order.orderId}</p>
                        <p className="admin-bus-stop">Bus Stop: {order.busStop}</p>
                        <p className="admin-bus-stop">Amount: ₹{order.totalAmount}</p>
                      </div>
                      <Link to="/tracking" className="admin-track-button">Track Live</Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent orders from DB */}
            <section className="admin-live-orders-section">
              <h2 className="admin-section-title">Recent Orders (Database)</h2>
              <div className="admin-orders-list">
                {recentOrders.length === 0 ? (
                  <div style={A.emptyBox}>
                    <i className="material-icons" style={{ fontSize:36, color:'#444' }}>receipt_long</i>
                    <p style={{ color:'#666', marginTop:8 }}>No orders found in database</p>
                  </div>
                ) : recentOrders.map(order => (
                  <div key={`${order.userPhoneNumber}_${order.orderId}_${order.orderDate}`} className="admin-order-card">
                    <div className="admin-order-details">
                      <div className="admin-order-info">
                        <p className="admin-order-number">Order #{order.orderId}</p>
                        <p className="admin-bus-stop">{order.userName || 'User'} · {order.userPhoneNumber}</p>
                        <p className="admin-bus-stop">{fmtDate(order.orderDate)} · ₹{fmt(order.totalAmount)} · {order.itemCount} items</p>
                      </div>
                      <span style={{ ...A.pillGreen, color: statusColor(order.paymentStatus), border:`1px solid ${statusColor(order.paymentStatus)}33`, background:'transparent' }}>
                        {String(order.paymentStatus || 'pending').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Partners quick overview */}
            <section className="admin-partners-section">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Active Partners</h2>
                <button style={A.viewAllBtn} onClick={() => setActiveTab('partners')}>View All →</button>
              </div>
              {approved.length === 0 ? (
                <p style={{ color:'#555', fontSize:'0.85rem', padding:'12px 0' }}>No approved partners yet.</p>
              ) : (
                <div className="admin-partners-list">
                  {approved.slice(0, 4).map(p => (
                    <div key={p._id} className="admin-partner-card" style={{ cursor:'pointer' }} onClick={() => setSelectedP(p)}>
                      <div style={A.partnerAvatar}>{p.name.charAt(0)}</div>
                      <div className="admin-partner-info">
                        <p className="admin-partner-name">{p.name}</p>
                        <p style={{ color:'#888', fontSize:'0.75rem', margin:0 }}>{p.assignedBusStop}</p>
                        <p style={{ color:'#4CAF50', fontSize:'0.72rem', fontWeight:600, margin:0 }}>
                          {p.completedOrders||0} orders · ₹{fmt(p.totalEarnings||0)} earned
                        </p>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                        <span style={{ ...A.pillGreen }}>Approved</span>
                        {(p.pendingEarnings||0) > 0 && (
                          <span style={A.pillOrange}>₹{fmt(p.pendingEarnings)} pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </>)}

          {/* ══════════════════ PENDING TAB ══════════════════ */}
          {activeTab === 'pending' && (
            <section style={{ padding:'0 0 24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h2 style={A.sectionH2}>Pending Applications</h2>
                <button onClick={reload} style={A.refreshBtn}>
                  <i className="material-icons" style={{ fontSize:16 }}>refresh</i> Refresh
                </button>
              </div>

              {pending.length === 0 ? (
                <div style={A.emptyBox}>
                  <i className="material-icons" style={{ fontSize:40, color:'#444' }}>inbox</i>
                  <p style={{ color:'#666', marginTop:8 }}>No pending applications</p>
                </div>
              ) : pending.map(p => (
                <div key={p._id} style={A.pendingCard}>
                  <div style={A.pendingHeader}>
                    <div style={A.partnerAvatar}>{p.name.charAt(0)}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ color:'#fff', fontWeight:700, margin:0, fontSize:'0.95rem' }}>{p.name}</p>
                      <p style={{ color:'#888', margin:0, fontSize:'0.78rem' }}>{p.email} · {p.phone}</p>
                      <p style={{ color:'#888', margin:'2px 0 0', fontSize:'0.78rem' }}>Applied: {fmtDate(p.joinedDate)}</p>
                    </div>
                    <span style={A.pillOrange}>Pending</span>
                  </div>

                  <div style={A.detailGrid}>
                    {[
                      { label:'Bus Stop',   value: p.assignedBusStop  },
                      { label:'Vehicle',    value: p.vehicleType       },
                      { label:'License',    value: p.licenseNumber     },
                    ].map(d => (
                      <div key={d.label} style={A.detailItem}>
                        <span style={A.detailLabel}>{d.label}</span>
                        <span style={A.detailValue}>{d.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Reject reason input */}
                  {rejectTarget === p._id && (
                    <div style={{ margin:'12px 0 0' }}>
                      <input
                        type="text"
                        placeholder="Reason for rejection (optional)"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        style={A.reasonInput}
                      />
                      <div style={{ display:'flex', gap:8, marginTop:8 }}>
                        <button style={A.confirmRejectBtn} onClick={() => handleRejectPartner(p._id)}>
                          Confirm Reject
                        </button>
                        <button style={A.cancelBtn} onClick={() => { setRejectTarget(null); setRejectReason(''); }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {rejectTarget !== p._id && (
                    <div style={{ display:'flex', gap:10, marginTop:14 }}>
                      <button style={A.approveBtn} onClick={() => handleApprovePartner(p._id)}>
                        <i className="material-icons" style={{ fontSize:18 }}>check_circle</i> Approve
                      </button>
                      <button style={A.rejectBtn} onClick={() => setRejectTarget(p._id)}>
                        <i className="material-icons" style={{ fontSize:18 }}>cancel</i> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Rejected partners archive */}
              {rejected.length > 0 && (
                <details style={{ marginTop:24 }}>
                  <summary style={{ color:'#555', fontSize:'0.82rem', cursor:'pointer', fontWeight:600 }}>
                    Rejected Applications ({rejected.length})
                  </summary>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:10 }}>
                    {rejected.map(p => (
                      <div key={p._id} style={{ ...A.pendingCard, opacity:0.65 }}>
                        <div style={A.pendingHeader}>
                          <div style={A.partnerAvatar}>{p.name.charAt(0)}</div>
                          <div style={{ flex:1 }}>
                            <p style={{ color:'#fff', fontWeight:700, margin:0, fontSize:'0.9rem' }}>{p.name}</p>
                            <p style={{ color:'#888', margin:0, fontSize:'0.75rem' }}>{p.email}</p>
                            {p.rejectReason && <p style={{ color:'#ff5555', margin:'2px 0 0', fontSize:'0.72rem' }}>Reason: {p.rejectReason}</p>}
                          </div>
                          <span style={A.pillRed}>Rejected</span>
                        </div>
                        <button style={{ ...A.approveBtn, marginTop:10 }} onClick={() => handleApprovePartner(p._id)}>
                          <i className="material-icons" style={{ fontSize:16 }}>undo</i> Re-approve
                        </button>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </section>
          )}

          {/* ══════════════════ PARTNERS TAB ══════════════════ */}
          {activeTab === 'partners' && (
            <section style={{ padding:'0 0 24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <h2 style={A.sectionH2}>Approved Partners ({approved.length})</h2>
                <button onClick={reload} style={A.refreshBtn}>
                  <i className="material-icons" style={{ fontSize:16 }}>refresh</i>
                </button>
              </div>

              {/* Search */}
              <div style={A.searchBox}>
                <i className="material-icons" style={{ color:'#555', fontSize:18 }}>search</i>
                <input
                  type="text"
                  placeholder="Search by name or bus stop…"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  style={A.searchInput}
                />
              </div>

              {filteredApproved.length === 0 ? (
                <div style={A.emptyBox}>
                  <i className="material-icons" style={{ fontSize:40, color:'#444' }}>group</i>
                  <p style={{ color:'#666', marginTop:8 }}>No approved partners yet</p>
                </div>
              ) : filteredApproved.map(p => (
                <div key={p._id} style={A.partnerRow} onClick={() => setSelectedP(p)}>
                  <div style={A.partnerAvatar}>{p.name.charAt(0)}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:'#fff', fontWeight:700, margin:0, fontSize:'0.92rem', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{p.name}</p>
                    <p style={{ color:'#888', margin:'2px 0 0', fontSize:'0.75rem' }}>{p.assignedBusStop} · {p.vehicleType}</p>
                    <div style={{ display:'flex', gap:12, marginTop:4, flexWrap:'wrap' }}>
                      <span style={{ color:'#2196F3', fontSize:'0.72rem', fontWeight:600 }}>📦 {p.completedOrders||0} orders</span>
                      <span style={{ color:'#68f91a', fontSize:'0.72rem', fontWeight:600 }}>💰 ₹{fmt(p.totalEarnings||0)}</span>
                      <span style={{ color:'#ffb84d', fontSize:'0.72rem', fontWeight:600 }}>⏳ ₹{fmt(p.pendingEarnings||0)} pending</span>
                      <span style={{ color:'#4CAF50', fontSize:'0.72rem', fontWeight:600 }}>✓ ₹{fmt(p.totalCredited||0)} credited</span>
                    </div>
                  </div>
                  <i className="material-icons" style={{ color:'#555', fontSize:20, flexShrink:0 }}>chevron_right</i>
                </div>
              ))}

              {/* Summary totals */}
              {filteredApproved.length > 0 && (
                <div style={A.totalsBox}>
                  <p style={{ color:'#555', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', margin:'0 0 8px', letterSpacing:'0.06em' }}>Platform Totals</p>
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                    <span style={{ color:'#68f91a', fontSize:'0.82rem' }}>Earned: <strong>₹{fmt(totalEarnings)}</strong></span>
                    <span style={{ color:'#4CAF50', fontSize:'0.82rem' }}>Credited: <strong>₹{fmt(totalCredited)}</strong></span>
                    <span style={{ color:'#ffb84d', fontSize:'0.82rem' }}>Pending: <strong>₹{fmt(totalPending)}</strong></span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ══════════════════ DATA TAB ══════════════════ */}
          {activeTab === 'data' && (
            <section style={{ padding:'0 0 24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <h2 style={A.sectionH2}>Database Snapshot</h2>
                <button onClick={reload} style={A.refreshBtn}>
                  <i className="material-icons" style={{ fontSize:16 }}>refresh</i>
                </button>
              </div>

              <div style={A.totalsBox}>
                <p style={{ color:'#555', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', margin:'0 0 8px', letterSpacing:'0.06em' }}>Overview</p>
                <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                  <span style={{ color:'#4da6ff', fontSize:'0.82rem' }}>Users: <strong>{fmt(summary.totalUsers)}</strong></span>
                  <span style={{ color:'#68f91a', fontSize:'0.82rem' }}>Orders: <strong>{fmt(summary.totalOrders)}</strong></span>
                  <span style={{ color:'#4CAF50', fontSize:'0.82rem' }}>Success: <strong>{fmt(summary.successOrders)}</strong></span>
                  <span style={{ color:'#ff5555', fontSize:'0.82rem' }}>Failed: <strong>{fmt(summary.failedOrders)}</strong></span>
                  <span style={{ color:'#ffb84d', fontSize:'0.82rem' }}>Pending: <strong>{fmt(summary.pendingOrders)}</strong></span>
                </div>
              </div>

              <div style={{ ...A.searchBox, marginTop:14 }}>
                <i className="material-icons" style={{ color:'#555', fontSize:18 }}>search</i>
                <input
                  type="text"
                  placeholder="Search orders by ID, user, phone, status…"
                  value={orderSearchQ}
                  onChange={e => setOrderSearchQ(e.target.value)}
                  style={A.searchInput}
                />
              </div>

              <h3 style={{ color:'#ddd', margin:'14px 0 10px', fontSize:'0.92rem' }}>Orders ({filteredOrders.length})</h3>
              {filteredOrders.length === 0 ? (
                <div style={A.emptyBox}>
                  <i className="material-icons" style={{ fontSize:34, color:'#444' }}>receipt</i>
                  <p style={{ color:'#666', marginTop:8 }}>No matching orders</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {filteredOrders.map(order => (
                    <div key={`${order.userPhoneNumber}_${order.orderId}_${order.orderDate}`} style={A.partnerRow}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ color:'#fff', fontWeight:700, margin:0, fontSize:'0.88rem' }}>#{order.orderId}</p>
                        <p style={{ color:'#888', margin:'2px 0 0', fontSize:'0.75rem' }}>{order.userName || 'User'} · {order.userPhoneNumber}</p>
                        <p style={{ color:'#888', margin:'3px 0 0', fontSize:'0.73rem' }}>{fmtDate(order.orderDate)} · ₹{fmt(order.totalAmount)} · {order.itemCount} items · {order.paymentMethod || '—'}</p>
                        <p style={{ color:'#888', margin:'3px 0 0', fontSize:'0.72rem' }}>Order: <span style={{ color:orderStatusColor(order.orderStatus) }}>{String(order.orderStatus || 'pending').toUpperCase()}</span> · Refund: {String(order.refundStatus || 'not_required').toUpperCase()} · Payment ID: {order.paymentId || 'N/A'}</p>
                      </div>
                      <span style={{ ...A.pillGreen, color: statusColor(order.paymentStatus), border:`1px solid ${statusColor(order.paymentStatus)}33`, background:'transparent' }}>
                        {String(order.paymentStatus || 'pending').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <h3 style={{ color:'#ddd', margin:'18px 0 10px', fontSize:'0.92rem' }}>Users ({users.length})</h3>
              {users.length === 0 ? (
                <div style={A.emptyBox}>
                  <i className="material-icons" style={{ fontSize:34, color:'#444' }}>group</i>
                  <p style={{ color:'#666', marginTop:8 }}>No users found in database</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {users.map(u => (
                    <div key={u.phoneNumber} style={A.partnerRow}>
                      <div style={A.partnerAvatar}>{(u.name || 'U').charAt(0).toUpperCase()}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ color:'#fff', fontWeight:700, margin:0, fontSize:'0.88rem' }}>{u.name || 'Unnamed User'}</p>
                        <p style={{ color:'#888', margin:'2px 0 0', fontSize:'0.75rem' }}>{u.phoneNumber}</p>
                        <p style={{ color:'#888', margin:'3px 0 0', fontSize:'0.73rem' }}>Orders: {u.orderCount || 0} · Joined: {fmtDate(u.createdAt)}</p>
                      </div>
                      <span style={u.isVerified ? A.pillGreen : A.pillOrange}>{u.isVerified ? 'VERIFIED' : 'UNVERIFIED'}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </main>
      </div>

      {/* ── Footer nav ── */}
      <footer className="admin-footer-nav">
        <div className="admin-nav-container">
          <Link className="admin-nav-item admin-nav-active" to="/admin">
            <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg"><path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0l.11.11,80,75.48A16,16,0,0,1,224,115.55Z"/></svg>
          </Link>
        </div>
      </footer>

      {/* ── Partner detail modal ── */}
      {selectedP && (
        <PartnerModal
          partner={selectedP}
          adminToken={adminToken}
          onClose={() => setSelectedP(null)}
          onUpdate={updatePartner}
        />
      )}

      {/* ── Reject confirmation dialog ── */}
      {rejectTarget && activeTab === 'pending' && (
        <div style={M.overlay}>
          <div style={{ ...M.modal, maxWidth:380 }}>
            <div style={M.modalHeader}>
              <h2 style={M.modalName}>Reject Application</h2>
              <button style={M.closeBtn} onClick={() => { setRejectTarget(null); setRejectReason(''); }}>
                <i className="material-icons">close</i>
              </button>
            </div>
            <div style={M.body}>
              <input type="text" placeholder="Reason (optional)" value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={A.reasonInput} />
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <button style={A.confirmRejectBtn} onClick={() => handleRejectPartner(rejectTarget)}>Confirm Reject</button>
                <button style={A.cancelBtn} onClick={() => { setRejectTarget(null); setRejectReason(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const A = {
  tabBar:      { display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'0 16px', backgroundColor:'rgba(0,0,0,0.2)' },
  tab:         { flex:1, padding:'12px 0', background:'none', border:'none', borderBottom:'2px solid transparent', color:'#555', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 },
  tabActive:   { color:'#68f91a', borderBottomColor:'#68f91a' },
  badge:       { backgroundColor:'#ffb84d', color:'#16230f', borderRadius:20, padding:'2px 6px', fontSize:'0.68rem', fontWeight:800 },

  statsSection:{ padding:'16px 16px 0' },
  statsGrid:   { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 },
  statCard:    { backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'14px 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:4, textAlign:'center' },
  statVal:     { fontWeight:800, fontSize:'1.1rem', margin:0, fontVariantNumeric:'tabular-nums' },
  statLbl:     { color:'#555', fontSize:'0.64rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em', margin:0 },

  sectionH2:   { color:'#fff', fontWeight:700, fontSize:'1.05rem', margin:0 },
  refreshBtn:  { display:'flex', alignItems:'center', gap:4, backgroundColor:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 10px', color:'#888', fontSize:'0.78rem', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" },

  pendingCard: { backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,184,77,0.2)', borderRadius:14, padding:16, marginBottom:12 },
  pendingHeader:{ display:'flex', alignItems:'flex-start', gap:12 },
  partnerAvatar:{ width:42, height:42, borderRadius:'50%', backgroundColor:'rgba(104,249,26,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#68f91a', fontWeight:800, fontSize:'1.1rem', flexShrink:0 },
  detailGrid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 },
  detailItem:  { display:'flex', flexDirection:'column', gap:2 },
  detailLabel: { color:'#555', fontSize:'0.68rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' },
  detailValue: { color:'#ddd', fontSize:'0.85rem', fontWeight:600 },

  approveBtn:  { display:'flex', alignItems:'center', gap:6, flex:1, justifyContent:'center', backgroundColor:'rgba(104,249,26,0.15)', border:'1px solid rgba(104,249,26,0.4)', borderRadius:10, padding:'10px 0', color:'#68f91a', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" },
  rejectBtn:   { display:'flex', alignItems:'center', gap:6, flex:1, justifyContent:'center', backgroundColor:'rgba(255,85,85,0.1)', border:'1px solid rgba(255,85,85,0.3)', borderRadius:10, padding:'10px 0', color:'#ff5555', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" },
  confirmRejectBtn:{ flex:1, backgroundColor:'#ff5555', border:'none', borderRadius:10, padding:'10px 0', color:'#fff', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" },
  cancelBtn:   { flex:1, backgroundColor:'rgba(255,255,255,0.08)', border:'none', borderRadius:10, padding:'10px 0', color:'#888', fontWeight:600, fontSize:'0.88rem', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" },
  reasonInput: { width:'100%', backgroundColor:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 12px', color:'#fff', fontSize:'0.85rem', fontFamily:"'Space Grotesk',sans-serif", outline:'none', boxSizing:'border-box' },

  searchBox:   { display:'flex', alignItems:'center', gap:8, backgroundColor:'rgba(255,255,255,0.05)', border:'1px solid rgba(104,249,26,0.15)', borderRadius:12, padding:'0 12px', marginBottom:14 },
  searchInput: { flex:1, background:'none', border:'none', outline:'none', color:'#fff', fontSize:'0.88rem', padding:'11px 0', fontFamily:"'Space Grotesk',sans-serif" },

  partnerRow:  { display:'flex', alignItems:'center', gap:12, backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(104,249,26,0.08)', borderRadius:14, padding:'14px 12px', marginBottom:8, cursor:'pointer' },
  totalsBox:   { backgroundColor:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'14px 16px', marginTop:16 },

  viewAllBtn:  { background:'none', border:'none', color:'#68f91a', fontSize:'0.82rem', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", textDecoration:'underline' },
  emptyBox:    { display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 20px', textAlign:'center' },

  pillGreen:   { backgroundColor:'rgba(104,249,26,0.1)', color:'#68f91a', fontSize:'0.65rem', fontWeight:700, borderRadius:20, padding:'3px 8px', flexShrink:0 },
  pillOrange:  { backgroundColor:'rgba(255,184,77,0.1)', color:'#ffb84d', fontSize:'0.65rem', fontWeight:700, borderRadius:20, padding:'3px 8px', flexShrink:0 },
  pillRed:     { backgroundColor:'rgba(255,85,85,0.1)', color:'#ff5555', fontSize:'0.65rem', fontWeight:700, borderRadius:20, padding:'3px 8px', flexShrink:0 },
};

// Modal styles
const M = {
  overlay:  { position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:0 },
  modal:    { backgroundColor:'#1a2e10', border:'1px solid rgba(104,249,26,0.15)', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto', fontFamily:"'Space Grotesk',sans-serif" },
  modalHeader:{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'20px 20px 0' },
  modalName:{ color:'#fff', fontWeight:800, margin:0, fontSize:'1.2rem' },
  modalSub: { color:'#888', margin:'4px 0 0', fontSize:'0.8rem' },
  closeBtn: { background:'none', border:'none', color:'#555', cursor:'pointer', padding:0, display:'flex', flexShrink:0 },
  body:     { padding:'16px 20px 32px', display:'flex', flexDirection:'column', gap:0 },
  divider:  { height:1, backgroundColor:'rgba(255,255,255,0.07)', margin:'14px 0' },
  row:      { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' },
  lbl:      { color:'#555', fontSize:'0.78rem' },
  val:      { color:'#ddd', fontSize:'0.82rem', fontWeight:600, textAlign:'right', maxWidth:'60%' },
  sectionHead:{ color:'#fff', fontWeight:700, fontSize:'0.9rem', margin:'0 0 10px' },
  statsGrid:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 },
  statBox:  { backgroundColor:'rgba(255,255,255,0.04)', borderRadius:10, padding:'12px 10px', textAlign:'center' },
  statVal:  { fontWeight:800, fontSize:'1.1rem', margin:'0 0 2px', fontVariantNumeric:'tabular-nums' },
  statLbl:  { color:'#555', fontSize:'0.65rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em', margin:0 },
  lastCreditBox:{ display:'flex', alignItems:'center', gap:8, backgroundColor:'rgba(76,175,80,0.06)', borderRadius:10, padding:'10px 12px', marginBottom:8 },
  histRow:  { display:'flex', alignItems:'center', gap:8, backgroundColor:'rgba(255,255,255,0.03)', borderRadius:8, padding:'8px 10px' },
  inputWrap:{ display:'flex', alignItems:'center', gap:6, backgroundColor:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'0 12px', flex:1 },
  input:    { flex:1, background:'none', border:'none', outline:'none', color:'#fff', fontSize:'0.88rem', padding:'10px 0', fontFamily:"'Space Grotesk',sans-serif" },
  creditBtn:{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', backgroundColor:'#68f91a', color:'#16230f', border:'none', borderRadius:12, padding:'13px 0', fontSize:'0.95rem', fontWeight:700, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", marginTop:4 },
};

export default Admin;