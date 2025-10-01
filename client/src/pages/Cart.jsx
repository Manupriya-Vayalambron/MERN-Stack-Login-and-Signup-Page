import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Eco-Friendly Water Bottle',
      malayalamName: 'പരിസ്ഥിതി സൗഹൃദ കുപ്പി',
      quantity: 2,
      price: 299,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp8o75HkwMhNSa9X37Rt5h9PWJXSaWN8uVaFgcjY1Wdk85IKZF_Qdgjf293anwPGhzjxlDJzPjm6p4Xug58zOx0nfzXMsyo1nIpg4xHy2zMU4TSO5hCaVFY0zAN-5RvWWWtngISaRNDZbXdZoSQgY65XleSWyGW4ON1jz-62rN2hLKxcamPW9_VmRe1_2X-z98_fejmCXFsSy84CzBHa-ItoevoIEuRdMWZ4NNSJW9jpFZVJQjy-MIwzyHIRrCVc1P6v07Pr7OM1M'
    },
    {
      id: 2,
      name: 'Organic Cotton T-Shirt',
      malayalamName: 'ഓർഗാനിക് കോട്ടൺ ടി-ഷർട്ട്',
      quantity: 1,
      price: 599,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCALnSEXms__1aOj50zX0w22DTJVxt7QF3u7okf8lZeGyaFg9iaCHS8Uji2JoSDS87DtviT5biL9lo1ateDiAIIEvg78bqntAFY2p4jBtqKMIsWUnl1F8kGSqDAXheLeZY1oijO2ZHgbe2FTtjfrMhdygqR_6DW3X0p9hIA7ZOu_AljrVm-Xc5CFGau7T2ckD5ccpBndHX_Y3Y1uaY6q_CpHqb-Bwo6f8i_-Ou-J7ywNS_DcesAj5wOLpBvQLmoF29geTD018rgRcA'
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="cart-page-container">
      <div className="cart-content-wrapper">
        <header className="cart-header">
          <Link to="/yathrika-home" className="cart-back-button">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </Link>
          <h1 className="cart-page-title">എന്റെ കാർട്ട് (Cart)</h1>
          <div className="cart-header-spacer"></div>
        </header>

        <main className="cart-main-content">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div 
                  className="cart-item-image" 
                  style={{backgroundImage: `url("${item.image}")`}}
                ></div>
                <div className="cart-item-details">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-name-local">{item.malayalamName}</p>
                  <p className="cart-item-price">₹{item.price}</p>
                </div>
                <div className="cart-quantity-controls">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="quantity-button quantity-decrease"
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="quantity-button quantity-increase"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Section */}
          <div className="cart-coupon-section">
            <div className="coupon-input-wrapper">
              <label className="coupon-input-label" htmlFor="coupon">കൂപ്പൺ കോഡ്</label>
              <input 
                className="coupon-input-field" 
                id="coupon" 
                placeholder="Enter coupon code" 
                type="text"
              />
            </div>
            <button className="coupon-apply-button">Apply</button>
          </div>

          {/* Price Details */}
          <div className="cart-price-details">
            <h2 className="price-details-title">Price Details</h2>
            <div className="price-breakdown">
              <div className="price-line">
                <p>Subtotal</p>
                <p>₹{getTotalPrice()}</p>
              </div>
              <div className="price-line">
                <p>Delivery Fee</p>
                <p>₹40</p>
              </div>
              <div className="price-line">
                <p>Discount</p>
                <p className="discount-amount">-₹20</p>
              </div>
              <div className="price-divider"></div>
              <div className="price-total">
                <p>Total (ആകെ)</p>
                <p>₹{getTotalPrice() + 40 - 20}</p>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="cart-checkout-section">
            <Link 
              to="/otp"
              className="cart-checkout-button"
            >
              <span>Proceed to Checkout</span>
            </Link>
          </div>
        </main>
      </div>

      <footer className="cart-footer-nav">
        <nav className="cart-nav-container">
          <Link className="cart-nav-item cart-nav-active" to="/yathrika-home">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
            </svg>
            <span className="cart-nav-text">Home</span>
          </Link>
          <Link className="cart-nav-item" to="/order-history">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M247.42,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,247.42,117ZM184,88h34.58l9.6,24H184ZM24,72H168v64H24ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm81-24H103a32,32,0,0,0-62,0H24V152H168v12.31A32.11,32.11,0,0,0,153,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,184,208Zm48-24H215a32.06,32.06,0,0,0-31-24V128h48Z"></path>
            </svg>
            <span className="cart-nav-text">Orders</span>
          </Link>
          <Link className="cart-nav-item" to="/user-profile">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
            </svg>
            <span className="cart-nav-text">Profile</span>
          </Link>
          <Link className="cart-nav-item" to="/notifications">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
            <span className="cart-nav-text">Notifications</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Cart;