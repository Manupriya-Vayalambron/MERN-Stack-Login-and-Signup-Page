import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto navigate to signin after 3 seconds if user doesn't click
    const timer = setTimeout(() => {
      navigate('/yathrika-signin');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/yathrika-signin');
  };

  return (
    <div className="splash-container">
      <div className="splash-content-wrapper">
        <svg 
          className="splash-logo-icon" 
          fill="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C15.87 2 19 5.13 19 9C19 14.25 12 22 12 22S5 14.25 5 9C5 5.13 8.13 2 12 2ZM12 11.5C13.38 11.5 14.5 10.38 14.5 9C14.5 7.62 13.38 6.5 12 6.5C10.62 6.5 9.5 7.62 9.5 9C9.5 10.38 10.62 11.5 12 11.5Z"></path>
        </svg>
        <h1 className="splash-main-title">Yathrika</h1>
        <p className="splash-tagline">Seamless. Convenient. Kerala.</p>
      </div>
      
      <div className="splash-bottom-section">
        <div className="splash-progress-indicators">
          <div className="progress-dot progress-dot-active"></div>
          <div className="progress-dot progress-dot-inactive"></div>
          <div className="progress-dot progress-dot-inactive"></div>
          <div className="progress-dot progress-dot-inactive"></div>
        </div>
        <div className="splash-description-section">
          <h2 className="splash-section-title">Easy Ordering</h2>
          <p className="splash-description-text">Your trusted partner for seamless delivery across Kerala.</p>
        </div>
      </div>
      
      <div className="splash-button-container">
        <button 
          onClick={handleGetStarted}
          className="splash-cta-button"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Splash;