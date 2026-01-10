import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const OrderSummary = () => {
  const navigate = useNavigate();
  const orderItems = [
    {
      name: 'Organic Vegetables',
      malayalamName: 'ഓർഗാനിക് പച്ചക്കറികൾ',
      quantity: 2,
      price: 150,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp8o75HkwMhNSa9X37Rt5h9PWJXSaWN8uVaFgcjY1Wdk85IKZF_Qdgjf293anwPGhzjxlDJzPjm6p4Xug58zOx0nfzXMsyo1nIpg4xHy2zMU4TSO5hCaVFY0zAN-5RvWWWtngISaRNDZbXdZoSQgY65XleSWyGW4ON1jz-62rN2hLKxcamPW9_VmRe1_2X-z98_fejmCXFsSy84CzBHa-ItoevoIEuRdMWZ4NNSJW9jpFZVJQjy-MIwzyHIRrCVc1P6v07Pr7OM1M'
    },
    {
      name: 'Fresh Fruits',
      malayalamName: 'പുതിയ പഴങ്ങൾ',
      quantity: 1,
      price: 200,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCALnSEXms__1aOj50zX0w22DTJVxt7QF3u7okf8lZeGyaFg9iaCHS8Uji2JoSDS87DtviT5biL9lo1ateDiAIIEvg78bqntAFY2p4jBtqKMIsWUnl1F8kGSqDAXheLeZY1oijO2ZHgbe2FTtjfrMhdygqR_6DW3X0p9hIA7ZOu_AljrVm-Xc5CFGau7T2ckD5ccpBndHX_Y3Y1uaY6q_CpHqb-Bwo6f8i_-Ou-J7ywNS_DcesAj5wOLpBvQLmoF29geTD018rgRcA'
    }
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 25;
  const total = subtotal + deliveryFee;

  return (
    <div className="order-summary-container">
      <div className="order-content-wrapper">
        <header className="order-header">
          <Link to="/cart" className="order-back-button">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </Link>
          <h1 className="order-page-title">Order Summary</h1>
          <div className="order-header-spacer"></div>
        </header>

        <main className="order-main-content">
          <h2 className="order-id-title">Order ID: #1234567890</h2>
          
          <div className="order-items-section">
            {orderItems.map((item, index) => (
              <div key={index} className="order-item-card">
                <div className="order-items-wrapper">
                  <div 
                    className="order-item-image" 
                    style={{backgroundImage: `url("${item.image}")`}}
                  ></div>
                  <div className="order-item-info">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-quantity">Quantity: {item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="delivery-section-title">Delivery Details</h3>
          <div className="delivery-details-section">
            <div className="delivery-detail-item">
              <div className="delivery-icon-wrapper">
                <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M128,16a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,120a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z"></path>
                </svg>
              </div>
              <div className="delivery-detail-text">
                <p className="delivery-detail-label">Bus Stop</p>
                <p className="delivery-detail-value">Kochi Bus Stop</p>
              </div>
            </div>
            
            <div className="delivery-detail-item">
              <div className="delivery-icon-wrapper">
                <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V104H224v88ZM32,88V64H224V88Z"></path>
                </svg>
              </div>
              <div className="delivery-detail-text">
                <p className="delivery-detail-label">Payment Method</p>
                <p className="delivery-detail-value">Credit Card</p>
              </div>
            </div>
          </div>

          <div className="order-action-buttons">
            <button className="order-secondary-button">Download</button>
            <button className="order-secondary-button">Share</button>
          </div>

          <div className="order-track-section">
            <button className="order-track-button" onClick={() => navigate('/tracking')}>Track Order</button>
          </div>
        </main>
      </div>

      <footer className="order-footer-nav">
        <nav className="order-nav-container">
          <Link className="order-nav-item" to="/yathrika-home">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"></path>
            </svg>
            <p className="order-nav-text">Home</p>
          </Link>
          <Link className="order-nav-item order-nav-active" to="/order-history">
            <div className="order-nav-badge-wrapper">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M247.43,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A8.13,8.13,0,0,0,247.43,117ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208ZM24,136V72H168v64Zm160,72a16,16,0,1,1,16-16A16,16,0,0,1,184,208Zm0-96V88h34.58l9.6,24Z"></path>
              </svg>
              <div className="order-nav-badge"></div>
            </div>
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
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
            <p className="order-nav-text">Notifications</p>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default OrderSummary;