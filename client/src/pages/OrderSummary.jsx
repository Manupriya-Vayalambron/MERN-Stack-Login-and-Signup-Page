import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../CartContext';
import '../index.css';

const OrderSummary = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { cartItems: contextItems, getTotalPrice, clearCart } = useCart();

  // Real payment data passed from Payment.jsx after success
  const {
    paymentId,
    orderId:       razorpayOrderId,   // Razorpay's order_xxx — for display only
    customOrderId,                     // YATH-xxx — the real tracking/partner ID
    amount,
    cartItems:     paidItems,
    paymentMethod,
  } = location.state || {};

  // customOrderId is the ID everything (Tracking, partner dashboard, socket rooms) uses.
  // Fall back to reading it from localStorage in case state was lost on refresh.
  const orderId = customOrderId
    || (() => { try { return JSON.parse(localStorage.getItem('yathrika_current_order') || 'null')?.orderId; } catch(_) { return null; } })()
    || razorpayOrderId;

  const orderItems   = paidItems?.length ? paidItems : contextItems;
  const displayItems = orderItems.length ? orderItems : [
    { name: 'Order Item', quantity: 1, price: amount || 0, image: '' },
  ];

  const subtotal    = displayItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const deliveryFee = 40;
  const discount    = 20;
  const total       = amount || (subtotal + deliveryFee - discount);

  const methodLabel = {
    upi:        'UPI',
    card:       'Debit / Credit Card',
    netbanking: 'Netbanking',
    wallet:     'Wallet',
  }[paymentMethod] || 'Online Payment';

  const shortOrderId   = orderId       ? String(orderId).slice(-10).toUpperCase()       : '—';
  const shortPaymentId = razorpayOrderId ? String(razorpayOrderId).slice(-12).toUpperCase() : '—';

  // ── Bus stop from localStorage ─────────────────────────────────────────────
  let busStop = null;
  try { busStop = JSON.parse(localStorage.getItem('yathrika_bus_stop') || 'null'); } catch(_) {}
  const stopName = busStop?.name || 'Not selected';

  // ── Write order data to localStorage so Tracking.jsx can read it ──────────
  // IMPORTANT: Payment.jsx already saved yathrika_current_order with the correct
  // customOrderId (YATH-xxx) before navigating here. We must NOT overwrite it
  // with the Razorpay order ID. Only write if nothing was saved yet (e.g. refresh).
  useEffect(() => {
    const existing = (() => { try { return JSON.parse(localStorage.getItem('yathrika_current_order') || 'null'); } catch(_) { return null; } })();
    // If existing record already has a YATH- orderId, trust it — don't overwrite
    if (existing?.orderId?.startsWith('YATH-')) return;
    // Otherwise write a best-effort record (e.g. user refreshed the page)
    if (!orderId && !paidItems) return;
    const orderData = {
      orderId:       orderId || ('ORD' + Date.now().toString().slice(-8)),
      paymentId:     paymentId || null,
      amount:        total,
      cartItems:     displayItems,
      paymentMethod: paymentMethod || 'upi',
      busStop,
      createdAt:     new Date().toISOString(),
    };
    localStorage.setItem('yathrika_current_order', JSON.stringify(orderData));
    localStorage.setItem('yathrika_cart', JSON.stringify(displayItems));
    clearCart();
  }, [orderId, paymentId]);

  // ── Generate invoice text for download / share ────────────────────────────
  const buildInvoiceText = () => {
    const line = '─'.repeat(40);
    const rows = displayItems.map(i =>
      `  ${i.name.padEnd(24)} ×${i.quantity}   ₹${(i.price * i.quantity).toString().padStart(5)}`
    ).join('\n');

    return [
      '         YATHRIKA — ORDER INVOICE',
      line,
      `Order ID    : #${shortOrderId}`,
      `Payment ID  : ${shortPaymentId}`,
      `Date        : ${new Date().toLocaleString('en-IN')}`,
      `Payment     : ${methodLabel}`,
      `Delivery    : ${stopName}`,
      line,
      'ITEMS',
      rows,
      line,
      `Subtotal                         ₹${subtotal.toString().padStart(5)}`,
      `Delivery Fee                     ₹${deliveryFee.toString().padStart(5)}`,
      `Discount                        -₹${discount.toString().padStart(5)}`,
      line,
      `TOTAL PAID                       ₹${total.toString().padStart(5)}`,
      line,
      '',
      'Thank you for travelling with Yathrika!',
      'Kerala\'s first on-route bus delivery service.',
    ].join('\n');
  };

  // ── Download as .txt invoice (works on all browsers without libraries) ────
  const handleDownload = () => {
    const text = buildInvoiceText();
    const blob  = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = `Yathrika_Invoice_${shortOrderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Web Share API (mobile native share sheet) ─────────────────────────────
  const handleShare = async () => {
    const text = buildInvoiceText();
    const shareData = {
      title: `Yathrika Order #${shortOrderId}`,
      text,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(text);
        alert('Invoice copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Last resort: open in new tab
        const blob = new Blob([text], { type: 'text/plain' });
        window.open(URL.createObjectURL(blob), '_blank');
      }
    }
  };

  return (
    <div className="order-summary-container">
      <div className="order-content-wrapper">
        <header className="order-header">
          <Link to="/yathrika-home" className="order-back-button">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </Link>
          <h1 className="order-page-title">Order Summary</h1>
          <div className="order-header-spacer"></div>
        </header>

        <main className="order-main-content">

          {/* Payment confirmed banner */}
          <div style={{
            display:'flex', alignItems:'center', gap:'0.75rem',
            background:'rgba(104,249,26,0.08)', border:'1px solid rgba(104,249,26,0.3)',
            borderRadius:'12px', padding:'0.875rem 1rem', marginBottom:'1.25rem',
          }}>
            <span className="material-icons" style={{ color:'var(--primary)', fontSize:'28px' }}>check_circle</span>
            <div>
              <p style={{ margin:0, fontWeight:700, color:'white', fontSize:'0.95rem' }}>Payment Confirmed</p>
              <p style={{ margin:0, fontSize:'0.75rem', color:'rgba(255,255,255,0.5)' }}>
                ₹{total} paid via {methodLabel}
              </p>
            </div>
          </div>

          {/* IDs */}
          <div style={{
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:'10px', padding:'0.75rem 1rem', marginBottom:'1rem',
            fontSize:'0.78rem', color:'rgba(255,255,255,0.5)',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
              <span>Order ID</span>
              <span style={{ color:'white', fontWeight:600, fontFamily:'monospace' }}>#{shortOrderId}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span>Payment ID</span>
              <span style={{ color:'white', fontWeight:600, fontFamily:'monospace' }}>{shortPaymentId}</span>
            </div>
          </div>

          {/* Order items */}
          <h2 className="order-id-title">Items Ordered</h2>
          <div className="order-items-section">
            {displayItems.map((item, i) => (
              <div key={i} className="order-item-card">
                <div className="order-items-wrapper">
                  {item.image && (
                    <div className="order-item-image" style={{ backgroundImage:`url("${item.image}")` }}></div>
                  )}
                  <div className="order-item-info">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-quantity">Qty: {item.quantity} · ₹{item.price} each</p>
                    <p style={{ margin:0, fontSize:'0.82rem', color:'var(--primary)', fontWeight:600 }}>
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div style={{
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:'12px', padding:'1rem', marginBottom:'1rem',
          }}>
            {[
              { label:'Subtotal',     val:`₹${subtotal}` },
              { label:'Delivery Fee', val:`₹${deliveryFee}` },
              { label:'Discount',     val:`-₹${discount}`, green:true },
            ].map(({ label, val, green }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem', fontSize:'0.85rem', color:green?'#68f91a':'rgba(255,255,255,0.6)' }}>
                <span>{label}</span><span>{val}</span>
              </div>
            ))}
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', marginTop:'0.5rem', paddingTop:'0.5rem', display:'flex', justifyContent:'space-between', fontWeight:700, color:'white' }}>
              <span>Total Paid</span>
              <span style={{ color:'var(--primary)' }}>₹{total}</span>
            </div>
          </div>

          {/* Delivery details */}
          <h3 className="delivery-section-title">Delivery Details</h3>
          <div className="delivery-details-section">
            <div className="delivery-detail-item">
              <div className="delivery-icon-wrapper">
                <span className="material-icons">location_on</span>
              </div>
              <div className="delivery-detail-text">
                <p className="delivery-detail-label">Bus Stop</p>
                <p className="delivery-detail-value">{stopName}</p>
              </div>
            </div>
            <div className="delivery-detail-item">
              <div className="delivery-icon-wrapper">
                <span className="material-icons">payment</span>
              </div>
              <div className="delivery-detail-text">
                <p className="delivery-detail-label">Payment Method</p>
                <p className="delivery-detail-value">{methodLabel}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="order-action-buttons">
            <button className="order-secondary-button" onClick={handleDownload}>
              <span className="material-icons" style={{ fontSize:16, verticalAlign:'middle', marginRight:4 }}>download</span>
              Download Invoice
            </button>
            <button className="order-secondary-button" onClick={handleShare}>
              <span className="material-icons" style={{ fontSize:16, verticalAlign:'middle', marginRight:4 }}>share</span>
              Share
            </button>
          </div>

          <div className="order-track-section">
            <button className="order-track-button" onClick={() => navigate('/tracking')}>
              Track Order
            </button>
          </div>

        </main>
      </div>

      <footer className="order-footer-nav">
        <nav className="order-nav-container">
          <Link className="order-nav-item" to="/yathrika-home">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77Z"></path>
            </svg>
            <p className="order-nav-text">Home</p>
          </Link>
          <Link className="order-nav-item order-nav-active" to="/order-history">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M247.43,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A8.13,8.13,0,0,0,247.43,117Z"></path>
            </svg>
            <p className="order-nav-text">Orders</p>
          </Link>
          <Link className="order-nav-item" to="/user-profile">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
            </svg>
            <p className="order-nav-text">Profile</p>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default OrderSummary;