import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../CartContext';
import '../index.css';

const OrderSummary = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { cartItems: contextItems, getTotalPrice } = useCart();

  // Read real payment data passed from Payment.jsx after success
  const {
    paymentId,
    orderId,
    amount,
    cartItems:   paidItems,
    paymentMethod,
  } = location.state || {};

  // Use items from navigation state (post-payment) or fall back to cart context
  const orderItems   = paidItems?.length ? paidItems : contextItems;
  const displayItems = orderItems.length ? orderItems : [
    { name: 'Order Item', quantity: 1, price: amount || 0, image: '' },
  ];

  const subtotal     = displayItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const deliveryFee  = 40;
  const discount     = 20;
  const total        = amount || (subtotal + deliveryFee - discount);

  const methodLabel = {
    upi:        'UPI',
    card:       'Debit / Credit Card',
    netbanking: 'Netbanking',
    wallet:     'Wallet',
  }[paymentMethod] || 'Online Payment';

  // Short display ID
  const shortOrderId  = orderId  ? orderId.slice(-10).toUpperCase()  : '—';
  const shortPaymentId = paymentId ? paymentId.slice(-12).toUpperCase() : '—';

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

          {/* ── Payment confirmed banner ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(104,249,26,0.08)',
            border: '1px solid rgba(104,249,26,0.3)',
            borderRadius: '12px',
            padding: '0.875rem 1rem',
            marginBottom: '1.25rem',
          }}>
            <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '28px' }}>check_circle</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Payment Confirmed</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                ₹{total} paid via {methodLabel}
              </p>
            </div>
          </div>

          {/* ── IDs ── */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>Order ID</span>
              <span style={{ color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>#{shortOrderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Payment ID</span>
              <span style={{ color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>{shortPaymentId}</span>
            </div>
          </div>

          {/* ── Order items ── */}
          <h2 className="order-id-title">Items Ordered</h2>
          <div className="order-items-section">
            {displayItems.map((item, i) => (
              <div key={i} className="order-item-card">
                <div className="order-items-wrapper">
                  {item.image && (
                    <div
                      className="order-item-image"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    ></div>
                  )}
                  <div className="order-item-info">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-quantity">
                      Qty: {item.quantity} · ₹{item.price} each
                    </p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Price breakdown ── */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
          }}>
            {[
              { label: 'Subtotal',     val: `₹${subtotal}` },
              { label: 'Delivery Fee', val: `₹${deliveryFee}` },
              { label: 'Discount',     val: `-₹${discount}`, green: true },
            ].map(({ label, val, green }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', color: green ? '#68f91a' : 'rgba(255,255,255,0.6)' }}>
                <span>{label}</span><span>{val}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'white' }}>
              <span>Total Paid</span>
              <span style={{ color: 'var(--primary)' }}>₹{total}</span>
            </div>
          </div>

          {/* ── Delivery details ── */}
          <h3 className="delivery-section-title">Delivery Details</h3>
          <div className="delivery-details-section">
            <div className="delivery-detail-item">
              <div className="delivery-icon-wrapper">
                <span className="material-icons">location_on</span>
              </div>
              <div className="delivery-detail-text">
                <p className="delivery-detail-label">Bus Stop</p>
                <p className="delivery-detail-value">Kochi Bus Stop</p>
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

          {/* ── Actions ── */}
          <div className="order-action-buttons">
            <button className="order-secondary-button">Download</button>
            <button className="order-secondary-button">Share</button>
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
          <Link className="order-nav-item" to="/notifications">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06Z"></path>
            </svg>
            <p className="order-nav-text">Notifications</p>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default OrderSummary;