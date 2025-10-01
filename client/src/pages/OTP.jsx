import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const OTP = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const navigate = useNavigate();
  
  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto focus next input
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('OTP:', otp.join(''));

    // Navigate to Order Summary page after OTP verification
    navigate('/order-summary');
  };

  return (
    <div className="otp-page-container">
      <div className="otp-content-wrapper">
        <header className="otp-header">
          <Link to="/yathrika-signin" className="otp-back-button">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="otp-page-title">Checkout</h1>
          <div className="otp-header-spacer"></div>
        </header>

        <main className="otp-main-content">
          <section className="otp-delivery-section">
            <h2 className="otp-section-title">Delivery</h2>
            <div className="otp-delivery-card">
              <div className="otp-delivery-item">
                <div className="otp-delivery-icon">
                  <span className="material-symbols-outlined">directions_bus</span>
                </div>
                <div className="otp-delivery-info">
                  <p className="otp-delivery-label">Bus Stop</p>
                  <p className="otp-delivery-value">Kochi Bus Stop - Yalikkulam</p>
                </div>
              </div>
              <div className="otp-divider"></div>
              <div className="otp-delivery-item">
                <div className="otp-delivery-icon">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div className="otp-delivery-info">
                  <p className="otp-delivery-label">Estimated Arrival</p>
                  <p className="otp-delivery-value">10:30 AM</p>
                </div>
              </div>
            </div>
          </section>

          <section className="otp-items-section">
            <h2 className="otp-section-title">Items</h2>
            <div className="otp-items-list">
              <div className="otp-item-card">
                <div className="otp-item-image" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDq8HU-vY7PJuIU4yF6LG7Kco41BiIQSLiMCFplZz9yw_RTavdczSdaL4HOeALt-Pm9nbnoCKpJRen1mBivTi5Tf0T5owgZe1ncc76jyWp5iEbZSxtsPRX6B2qeZwIsPa0Szo5qi2dve_ID8PjsPndVywdWD3nmNPRaGtaYI7wbwmhlGvcrqfznmWqeY-6V5wMJlJIwE1EYi3woMrR3-yO_OrZ2wh12SJPGYFAVdUm5dz2t3BlLi7gRwz_NyKwY7nA5UeySeQXn4w")'}}></div>
                <div className="otp-item-details">
                  <p className="otp-item-name">Futuristic Gadget</p>
                  <p className="otp-item-quantity">Quantity: 2</p>
                </div>
                <p className="otp-item-price">₹1998</p>
              </div>
              <div className="otp-item-card">
                <div className="otp-item-image" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCg6Z698cJvnsZJpUxbm6hPaXArq9e7KQyI5vP5HWxqpoci8G53N6a7Y3_Ahbt3xKgwbR1kJe1rf9M7Eu2N5ZoCwhFaPDMV8i7c9_AALE_KPcNDS5Akqy6KHlFmq7adL9m11SjxJUXxcCJhjrqs3CO89SPi2xXRzH8tGXhyYBekhHj5mdy8Uzv5ZBv5v1JqIMX7DFMVFASGd7dtrkwF61eGXFWzbS8qklH3wQaPHHiiL1QOFPRmZ_kBWWid6j-r5-nG-IdUAnys1xg")'}}></div>
                <div className="otp-item-details">
                  <p className="otp-item-name">Cyberpunk Headset</p>
                  <p className="otp-item-quantity">Quantity: 1</p>
                </div>
                <p className="otp-item-price">₹2499</p>
              </div>
            </div>
          </section>

          <section className="otp-payment-section">
            <h2 className="otp-section-title">Payment Method</h2>
            <div className="otp-payment-options">
              <label className="otp-payment-option otp-payment-selected">
                <span className="otp-payment-label">UPI</span>
                <input type="radio" name="payment_method" defaultChecked className="otp-payment-radio" />
              </label>
              <label className="otp-payment-option">
                <span className="otp-payment-label">Credit/Debit Card</span>
                <input type="radio" name="payment_method" className="otp-payment-radio" />
              </label>
              <label className="otp-payment-option">
                <span className="otp-payment-label">Wallets</span>
                <input type="radio" name="payment_method" className="otp-payment-radio" />
              </label>
              <label className="otp-payment-option">
                <span className="otp-payment-label">Cash on Delivery (COD)</span>
                <input type="radio" name="payment_method" className="otp-payment-radio" />
              </label>
            </div>
          </section>

          <div className="otp-pay-button-container">
            <button className="otp-pay-button">Pay ₹4497 Now</button>
          </div>
        </main>
      </div>

      <div className="otp-modal-overlay">
        <div className="otp-modal-container">
          <div className="otp-modal-handle"></div>
          <h2 className="otp-modal-title">Enter OTP</h2>
          <p className="otp-modal-description">An OTP has been sent to your registered mobile number.</p>
          
          <form className="otp-form" onSubmit={handleSubmit}>
            <div className="otp-inputs-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="otp-input-field"
                />
              ))}
            </div>
            
            <button type="submit" className="otp-confirm-button">
              Confirm Payment
            </button>

            <button type="button" className="otp-resend-button">
              Resend OTP
            </button>
          </form>
        </div>
      </div>

      <footer className="otp-footer-nav">
        <nav className="otp-nav-container">
          <Link className="otp-nav-item otp-nav-active" to="/yathrika-home">
            <span className="material-symbols-outlined otp-nav-icon-filled">home</span>
            <span className="otp-nav-text otp-nav-text-active">Home</span>
          </Link>
          <Link className="otp-nav-item" to="/order-history">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="otp-nav-text">Orders</span>
          </Link>
          <Link className="otp-nav-item" to="/user-profile">
            <span className="material-symbols-outlined">person</span>
            <span className="otp-nav-text">Profile</span>
          </Link>
          <Link className="otp-nav-item" to="/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="otp-nav-text">Notifications</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default OTP;