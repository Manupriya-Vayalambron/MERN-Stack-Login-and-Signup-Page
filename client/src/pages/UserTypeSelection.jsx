import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleUserTypeSelect = (type) => {
    if (type === 'customer') {
      navigate('/yathrika-signin');
    } else if (type === 'partner') {
      navigate('/delivery-partner-auth');
    }
  };

  return (
    <div className="user-type-container">
      <div className="user-type-wrapper">
        <header className="user-type-header">
          <Link to="/splash" className="user-type-back-button">
            <i className="material-icons">arrow_back</i>
          </Link>
          <div className="user-type-logo">
            <svg 
              className="user-type-logo-icon" 
              fill="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C15.87 2 19 5.13 19 9C19 14.25 12 22 12 22S5 14.25 5 9C5 5.13 8.13 2 12 2ZM12 11.5C13.38 11.5 14.5 10.38 14.5 9C14.5 7.62 13.38 6.5 12 6.5C10.62 6.5 9.5 7.62 9.5 9C9.5 10.38 10.62 11.5 12 11.5Z"></path>
            </svg>
          </div>
          <div className="user-type-header-spacer"></div>
        </header>

        <main className="user-type-main">
          <div className="user-type-content">
            <div className="user-type-intro">
              <h1 className="user-type-title">Welcome to Yathrika</h1>
              <p className="user-type-subtitle">Choose how you'd like to get started</p>
            </div>

            <div className="user-type-options">
              <div 
                onClick={() => handleUserTypeSelect('customer')}
                className="user-type-option customer-option"
              >
                <div className="user-type-option-icon">
                  <svg 
                    fill="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                  </svg>
                </div>
                <div className="user-type-option-content">
                  <h2 className="user-type-option-title">I'm a Customer</h2>
                  <p className="user-type-option-description">
                    Order products and get them delivered to your bus stop
                  </p>
                  <div className="user-type-option-features">
                    <div className="feature-item">
                      <i className="material-icons">shopping_cart</i>
                      <span>Browse & Order</span>
                    </div>
                    <div className="feature-item">
                      <i className="material-icons">my_location</i>
                      <span>Live Tracking</span>
                    </div>
                    <div className="feature-item">
                      <i className="material-icons">payment</i>
                      <span>Easy Payments</span>
                    </div>
                  </div>
                </div>
                <div className="user-type-option-arrow">
                  <i className="material-icons">arrow_forward</i>
                </div>
              </div>

              <div 
                onClick={() => handleUserTypeSelect('partner')}
                className="user-type-option partner-option"
              >
                <div className="user-type-option-icon">
                  <svg 
                    fill="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19 7C19 6.45 18.55 6 18 6C17.45 6 17 6.45 17 7H7C6.45 7 6 7.45 6 8S6.45 9 7 9H17C17 9.55 17.45 10 18 10C18.55 10 19 9.55 19 9V7ZM21 11C20.45 11 20 11.45 20 12C20 12.55 20.45 13 21 13C21.55 13 22 12.55 22 12C22 11.45 21.55 11 21 11ZM18 13C17.45 13 17 13.45 17 14C17 14.55 17.45 15 18 15C18.55 15 19 14.55 19 14C19 13.45 18.55 13 18 13ZM18 16C17.45 16 17 16.45 17 17C17 17.55 17.45 18 18 18C18.55 18 19 17.55 19 17C19 16.45 18.55 16 18 16ZM21 16C20.45 16 20 16.45 20 17C20 17.55 20.45 18 21 18C21.55 18 22 17.55 22 17C22 16.45 21.55 16 21 16ZM3 12C2.45 12 2 12.45 2 13C2 13.55 2.45 14 3 14C3.55 14 4 13.55 4 13C4 12.45 3.55 12 3 12ZM6 11C5.45 11 5 11.45 5 12C5 12.55 5.45 13 6 13C6.55 13 7 12.55 7 12C7 11.45 6.55 11 6 11Z"/>
                  </svg>
                </div>
                <div className="user-type-option-content">
                  <h2 className="user-type-option-title">I'm a Delivery Partner</h2>
                  <p className="user-type-option-description">
                    Earn money by delivering orders to customers at bus stops
                  </p>
                  <div className="user-type-option-features">
                    <div className="feature-item">
                      <i className="material-icons">attach_money</i>
                      <span>Earn Income</span>
                    </div>
                    <div className="feature-item">
                      <i className="material-icons">schedule</i>
                      <span>Flexible Hours</span>
                    </div>
                    <div className="feature-item">
                      <i className="material-icons">trending_up</i>
                      <span>Track Earnings</span>
                    </div>
                  </div>
                </div>
                <div className="user-type-option-arrow">
                  <i className="material-icons">arrow_forward</i>
                </div>
              </div>
            </div>

            <div className="user-type-footer">
              <p className="user-type-footer-text">
                Don't know which option to choose? 
                <Link to="/live-tracking-demo" className="user-type-demo-link">
                  Try our demo
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserTypeSelection;