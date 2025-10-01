import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const YathrikaSignin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signin logic here
    console.log('Phone number:', phoneNumber);

    // Navigate to Routes after form submission
    navigate('/routes');
  };

  return (
    <div className="signin-page-container">
      <header className="signin-header">
        <h1 className="signin-brand-title">Yathrika</h1>
        <button className="signin-language-button">
          <span className="material-symbols-outlined">language</span>
        </button>
      </header>

      <main className="signin-main-content">
        <div className="signin-card">
          <div className="signin-welcome-section">
            <h2 className="signin-welcome-title">Welcome</h2>
            <p className="signin-instruction-text">Enter your phone number to sign in</p>
            <p className="signin-instruction-text-local">നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകുക</p>
          </div>

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="signin-input-container">
              <input 
                className="signin-phone-input" 
                placeholder="Phone Number" 
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <button 
              className="signin-continue-button" 
              type="submit"
            >
              Continue
            </button>
          </form>
        </div>
      </main>

      <footer className="signin-footer">
        <p className="signin-terms-text">
          By continuing, you agree to our{' '}
          <Link className="signin-link" to="/terms">Terms of Service</Link> and{' '}
          <Link className="signin-link" to="/privacy">Privacy Policy</Link>.
        </p>
      </footer>
    </div>
  );
};

export default YathrikaSignin;