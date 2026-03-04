import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt    = (n) => typeof n === 'number' ? n.toLocaleString('en-IN') : '0';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';

// API helper functions
const fetchAllPartners = async () => {
  const response = await fetch('/api/admin/delivery-partners');
  if (!response.ok) throw new Error('Failed to fetch partners');
  return response.json();
};

const approvePartner = async (id) => {
  const response = await fetch(`/api/admin/delivery-partners/${id}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error('Failed to approve partner');
  return response.json();
};

const rejectPartner = async (id, rejectReason) => {
  const response = await fetch(`/api/admin/delivery-partners/${id}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rejectReason })
  });
  if (!response.ok) throw new Error('Failed to reject partner');
  return response.json();
};

// ─── Sub-component: Partner detail/credit modal ────────────────────────────────
const PartnerModal = ({ partner, onClose, onUpdate }) => {
  const [creditAmt,  setCreditAmt]  = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [msg,        setMsg]        = useState('');

  const handleCredit = () => {
    const amount = parseFloat(creditAmt);
    if (!amount || amount <= 0) { setMsg('Enter a valid amount'); return; }

    const entry = { amount, note: creditNote.trim(), creditedBy:'admin', creditedAt: new Date().toISOString() };
    const updated = {
      ...partner,
      creditHistory:    [...(partner.creditHistory || []), entry],
      totalCredited:    (partner.totalCredited    || 0) + amount,
      pendingEarnings:  Math.max(0, (partner.pendingEarnings || 0) - amount),
      lastCreditAmount: amount,
      lastCreditDate:   new Date().toISOString(),
    };
    onUpdate(updated);
    setCreditAmt('');
    setCreditNote('');
    setMsg(`✓ ₹${fmt(amount)} credited successfully`);
    setTimeout(() => setMsg(''), 3000);
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
                    <span style={{ color:'#888', fontSize:'0.78rem', flex:1 }}>{c.note||'—'}</span>
                    <span style={{ color:'#555', fontSize:'0.72rem', flexShrink:0 }}>{fmtDate(c.creditedAt)}</span>
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
          <button style={M.creditBtn} onClick={handleCredit}>
            <i className="material-icons" style={{ fontSize:18 }}>payments</i>
            Credit ₹{creditAmt || '0'} to {partner.name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Admin Component ─────────────────────────────────────────────────────
const Admin = () => {
  const [activeTab,    setActiveTab]    = useState('dashboard');  // dashboard | partners | pending
  const [partners,     setPartners]     = useState([]);
  const [selectedP,    setSelectedP]    = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQ,      setSearchQ]      = useState('');

  // Load partners from backend API
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const allPartners = await fetchAllPartners();
        setPartners(allPartners);
      } catch (error) {
        console.error('Error loading partners:', error);
        // Fallback to localStorage for backwards compatibility
        const localPartners = JSON.parse(localStorage.getItem('deliveryPartners') || '[]');
        setPartners(localPartners);
      }
    };
    loadPartners();
  }, []);

  const reload = async () => {
    try {
      const allPartners = await fetchAllPartners();
      setPartners(allPartners);
    } catch (error) {
      console.error('Error reloading partners:', error);
    }
  };

  // Approve
  const handleApprovePartner = async (id) => {
    try {
      await approvePartner(id);
      await reload(); // Refresh the list
      
      // Also update localStorage if partner is currently logged in
      const currentPartner = JSON.parse(localStorage.getItem('deliveryPartner') || 'null');
      if (currentPartner?._id === id) {
        const updatedPartners = await fetchAllPartners();
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
      await rejectPartner(id, rejectReason);
      await reload(); // Refresh the list
      setRejectTarget(null);
      setRejectReason('');
      
      // Also update localStorage if partner is currently logged in
      const currentPartner = JSON.parse(localStorage.getItem('deliveryPartner') || 'null');
      if (currentPartner?._id === id) {
        const updatedPartners = await fetchAllPartners();
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
      // For now, just update locally - in production you'd have a credit API endpoint
      const next = partners.map(p => p._id === updated._id ? updated : p);
      setPartners(next);
      setSelectedP(updated);
      
      // Update localStorage if it's the currently logged in partner
      const currentPartner = JSON.parse(localStorage.getItem('deliveryPartner') || 'null');
      if (currentPartner?._id === updated._id) {
        localStorage.setItem('deliveryPartner', JSON.stringify(updated));
      }
      
      // TODO: Implement backend API for crediting partners
      console.log('Credit action - TODO: implement backend API');
    } catch (error) {
      console.error('Error updating partner:', error);
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
  const totalOrders    = approved.reduce((s,p) => s+(p.completedOrders||0), 0);

  const liveOrders = [
    { id:'12345', busStop:'Central Station' },
    { id:'67890', busStop:'University' },
  ];

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
            </div>
          </div>
        </header>

        {/* ── Tab bar ── */}
        <div style={A.tabBar}>
          {[
            { key:'dashboard', label:'Dashboard' },
            { key:'pending',   label:`Pending${pending.length ? ` (${pending.length})` : ''}` },
            { key:'partners',  label:'Partners' },
          ].map(tab => (
            <button key={tab.key} style={{ ...A.tab, ...(activeTab===tab.key ? A.tabActive : {}) }} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
              {tab.key === 'pending' && pending.length > 0 && (
                <span style={A.badge}>{pending.length}</span>
              )}
            </button>
          ))}
        </div>

        <main className="admin-main-content">

          {/* ══════════════════ DASHBOARD TAB ══════════════════ */}
          {activeTab === 'dashboard' && (<>

            {/* Summary cards */}
            <section style={A.statsSection}>
              <div style={A.statsGrid}>
                {[
                  { label:'Active Partners',  value: approved.length,       icon:'people',             color:'#2196F3' },
                  { label:'Orders Completed', value: fmt(totalOrders),       icon:'local_shipping',     color:'#68f91a' },
                  { label:'Total Earned',     value:`₹${fmt(totalEarnings)}`, icon:'account_balance_wallet', color:'#68f91a' },
                  { label:'Total Credited',   value:`₹${fmt(totalCredited)}`, icon:'payments',          color:'#4CAF50' },
                  { label:'Pending Payout',   value:`₹${fmt(totalPending)}`,  icon:'pending',           color:'#ffb84d' },
                  { label:'Pending Approval', value: pending.length,          icon:'hourglass_top',     color:'#ffb84d' },
                ].map(s => (
                  <div key={s.label} style={A.statCard}>
                    <i className="material-icons" style={{ color:s.color, fontSize:24 }}>{s.icon}</i>
                    <p style={{ ...A.statVal, color:s.color }}>{s.value}</p>
                    <p style={A.statLbl}>{s.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Live orders */}
            <section className="admin-live-orders-section">
              <h2 className="admin-section-title">Live Orders</h2>
              <div className="admin-orders-list">
                {liveOrders.map(order => (
                  <div key={order.id} className="admin-order-card">
                    <div className="admin-order-details">
                      <div className="admin-order-info">
                        <p className="admin-order-number">Order #{order.id}</p>
                        <p className="admin-bus-stop">Bus Stop: {order.busStop}</p>
                      </div>
                      <Link to="/tracking" className="admin-track-button">Track Live</Link>
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

        </main>
      </div>

      {/* ── Footer nav ── */}
      <footer className="admin-footer-nav">
        <div className="admin-nav-container">
          {[
            { to:'/admin',     icon:<svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg"><path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0l.11.11,80,75.48A16,16,0,0,1,224,115.55Z"/></svg>, active:true },
            { to:'/analytics', icon:<svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg"><path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0v94.37L90.73,98a8,8,0,0,1,10.07-.38l58.81,44.11L218.73,90a8,8,0,1,1,10.54,12l-64,56a8,8,0,0,1-10.07.38L96.39,114.29,40,163.63V200H224A8,8,0,0,1,232,208Z"/></svg> },
            { to:'/users',     icon:<svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg"><path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Z"/></svg> },
            { to:'/routes',    icon:<svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg"><path d="M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-5.52-.6l-64,16A8,8,0,0,0,24,56V200a8,8,0,0,0,9.94,7.76l61.13-15.28,61.35,30.68A8.15,8.15,0,0,0,160,224a8,8,0,0,0,1.94-.24l64-16A8,8,0,0,0,232,200V56A8,8,0,0,0,228.92,49.69Z"/></svg> },
          ].map(item => (
            <Link key={item.to} className={`admin-nav-item${item.active?' admin-nav-active':''}`} to={item.to}>
              {item.icon}
            </Link>
          ))}
        </div>
      </footer>

      {/* ── Partner detail modal ── */}
      {selectedP && (
        <PartnerModal
          partner={selectedP}
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