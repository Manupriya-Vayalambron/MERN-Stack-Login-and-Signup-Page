import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Tracking = () => {
  const [timeRemaining, setTimeRemaining] = useState({
    minutes: 15,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const orderDetails = {
    id: '#1234567890',
    items: 2,
    total: 250,
    deliveryLocation: 'Kochi Bus Stop'
  };

  const trackingStages = [
    { name: 'CONFIRMED', active: true },
    { name: 'PACKED', active: false },
    { name: 'PARTNER AT STOP', active: false },
    { name: 'HANDOVER', active: false }
  ];

  return (
    <div className="tracking-page-container">
      <div className="tracking-content-wrapper">
        <header className="tracking-header">
          <Link to="/order-history" className="tracking-back-button">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="tracking-page-title">Order Tracking</h1>
          <div className="tracking-header-spacer"></div>
        </header>
        
        <main className="tracking-main-content">
          <div className="tracking-progress-card">
            <div className="tracking-stages-section">
              <div className="tracking-stages-labels">
                {trackingStages.map((stage, index) => (
                  <span key={index} className={stage.active ? 'tracking-stage-active' : 'tracking-stage-inactive'}>
                    {stage.name}
                  </span>
                ))}
              </div>
              <div className="tracking-progress-bar-container">
                <div className="tracking-progress-bar" style={{width: '25%'}}></div>
              </div>
            </div>
            
            <div className="tracking-status-section">
              <h2 className="tracking-status-title">Order Confirmed</h2>
              <p className="tracking-status-description">Your order has been confirmed and is being prepared.</p>
            </div>
          </div>
          
          <div className="tracking-countdown-section">
            <p className="tracking-countdown-label">Your order will arrive at the bus stop in:</p>
            <div className="tracking-timer-container">
              <div className="tracking-timer-item">
                <div className="tracking-timer-box">
                  <p className="tracking-timer-value">{timeRemaining.minutes}</p>
                </div>
                <p className="tracking-timer-text">Minutes</p>
              </div>
              <div className="tracking-timer-item">
                <div className="tracking-timer-box">
                  <p className="tracking-timer-value">{timeRemaining.seconds}</p>
                </div>
                <p className="tracking-timer-text">Seconds</p>
              </div>
            </div>
          </div>
          
          <div className="tracking-details-section">
            <h3 className="tracking-section-title">Order Details</h3>
            <div className="tracking-details-card">
              <div className="tracking-detail-row">
                <p className="tracking-detail-label">Order ID</p>
                <p className="tracking-detail-value">{orderDetails.id}</p>
              </div>
              <div className="tracking-detail-row">
                <p className="tracking-detail-label">Items</p>
                <p className="tracking-detail-value">{orderDetails.items} items</p>
              </div>
              <div className="tracking-detail-row">
                <p className="tracking-detail-label">Total</p>
                <p className="tracking-detail-value">₹ {orderDetails.total}</p>
              </div>
            </div>
          </div>
          
          <div className="tracking-delivery-section">
            <h3 className="tracking-section-title">Delivery</h3>
            <div className="tracking-delivery-card">
              <div className="tracking-detail-row">
                <p className="tracking-detail-label">Delivery Location</p>
                <p className="tracking-detail-value">{orderDetails.deliveryLocation}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <footer className="tracking-footer-nav">
        <div className="tracking-nav-container">
          <Link className="tracking-nav-item" to="/yathrika-home">
            <span className="material-symbols-outlined">home</span>
            <span className="tracking-nav-text">Home</span>
          </Link>
          <Link className="tracking-nav-item tracking-nav-active" to="/order-history">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="tracking-nav-text">Orders</span>
          </Link>
          <Link className="tracking-nav-item" to="/user-profile">
            <span className="material-symbols-outlined">person</span>
            <span className="tracking-nav-text">Profile</span>
          </Link>
          <Link className="tracking-nav-item" to="/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="tracking-nav-text">Notifications</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Tracking;