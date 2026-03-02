import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';
import '../index.css';

const YathrikaSignin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Firebase uses 6-digit OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { signIn } = useUser();

  // Setup reCAPTCHA - create fresh each time
  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal', // Changed to normal for better debugging
      callback: (response) => {
        console.log('reCAPTCHA verified', response);
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        window.recaptchaVerifier = null;
      }
    });
    
    return window.recaptchaVerifier.render();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      // Setup fresh reCAPTCHA and wait for it to render
      await setupRecaptcha();
      
      // Format with country code (+91 for India)
      const formattedPhone = '+91' + phoneNumber;
      
      // Send OTP via Firebase
      const confirmation = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        window.recaptchaVerifier
      );
      
      setConfirmationResult(confirmation);
      setShowOtpModal(true);
      setError('');
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      // Clear reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');
      
      // Auto focus next input
      if (value && index < 5) {
        document.getElementById(`signin-otp-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`signin-otp-${index - 1}`).focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // Verify OTP with Firebase
      await confirmationResult.confirm(enteredOtp);
      console.log('Firebase OTP verified successfully!');
      
      // Format phone number for database
      const formattedPhone = '+91' + phoneNumber;
      
      // Sign in user using our context (which calls the backend)
      const result = await signIn(formattedPhone, {
        name: '' // Empty name initially, user can update later
      });
      
      if (result.success) {
        console.log('User signed in and saved to database:', result.user);
        navigate('/routes');
      } else {
        throw new Error(result.error || 'Failed to save user to database');
      }
    } catch (err) {
      console.error('Error during OTP verification or user creation:', err);
      if (err.message.includes('auth/invalid-verification-code')) {
        setError('Invalid OTP. Please try again.');
      } else if (err.message.includes('database') || err.message.includes('save')) {
        // Firebase OTP was successful but database save failed
        setError('OTP verified but failed to save user data. Please try again.');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
      setOtp(['', '', '', '', '', '']);
      document.getElementById('signin-otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setOtp(['', '', '', '', '', '']);
    setError('');

    try {
      const formattedPhone = '+91' + phoneNumber;
      const confirmation = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      alert('New OTP sent successfully!');
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowOtpModal(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  return (
    <div className="signin-page-container">
      <header className="signin-header">
        <div className="header-placeholder" />
        <h1 className="signin-brand-title">Yathrika</h1>
        <div className="header-placeholder" />
      </header>

      <main className="signin-main-content">
        <div className="signin-card">
          <div className="signin-welcome-section">
            <h2 className="signin-welcome-title">{language === 'en' ? 'Welcome' : 'സ്വാഗതം'}</h2>
            <p className="signin-instruction-text">
              {language === 'en' ? 'Enter your phone number to sign in' : 'സൈൻ ഇൻ ചെയ്യാൻ നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകുക'}
            </p>
          </div>

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="signin-input-container">
              <input 
                className="signin-phone-input" 
                placeholder={language === 'en' ? "Phone Number" : "ഫോൺ നമ്പർ"} 
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
              />
            </div>
            {error && !showOtpModal && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '10px' }}>{error}</p>
            )}
            <button 
              className="signin-continue-button" 
              type="submit"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
          </form>
          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container"></div>
        </div>
      </main>

      <footer className="signin-footer">
        <p className="signin-terms-text">
          By continuing, you agree to our{' '}
          <Link className="signin-link" to="/terms">Terms of Service</Link> and{' '}
          <Link className="signin-link" to="/privacy">Privacy Policy</Link>.
        </p>
      </footer>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="otp-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(22, 35, 15, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="otp-modal-container" style={{
            backgroundColor: 'rgba(22, 35, 15, 0.95)',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            position: 'relative',
            border: '1px solid rgba(104, 249, 26, 0.3)',
            boxShadow: '0 0 30px rgba(104, 249, 26, 0.2)',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            <button 
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                color: 'rgba(104, 249, 26, 0.8)',
                cursor: 'pointer',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
            
            <h2 style={{ 
              color: '#fff', 
              textAlign: 'center', 
              marginBottom: '8px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              Enter OTP
            </h2>
            <p style={{ 
              color: 'rgb(209, 213, 219)', 
              textAlign: 'center', 
              marginBottom: '24px',
              fontSize: '14px',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              A 6-digit OTP has been sent to +91 {phoneNumber}
            </p>
            
            <form onSubmit={handleOtpSubmit}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`signin-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    style={{
                      width: '42px',
                      height: '50px',
                      textAlign: 'center',
                      fontSize: '22px',
                      fontWeight: 'bold',
                      border: '2px solid rgba(104, 249, 26, 0.3)',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(22, 35, 15, 0.7)',
                      color: '#68f91a',
                      outline: 'none',
                      fontFamily: "'Space Grotesk', sans-serif",
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 15px 2px rgba(104, 249, 26, 0.5)';
                      e.target.style.borderColor = '#68f91a';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = 'rgba(104, 249, 26, 0.3)';
                    }}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              
              {error && (
                <p style={{ 
                  color: '#ef4444', 
                  textAlign: 'center', 
                  fontSize: '14px',
                  marginBottom: '16px',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}>
                  {error}
                </p>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#68f91a',
                  color: '#16230f',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '12px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: '0 0 20px rgba(104, 249, 26, 0.5)',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = 'rgba(104, 249, 26, 0.9)')}
                onMouseOut={(e) => e.target.style.backgroundColor = '#68f91a'}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#68f91a',
                  border: '2px solid rgba(104, 249, 26, 0.5)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontFamily: "'Space Grotesk', sans-serif",
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = 'rgba(104, 249, 26, 0.1)';
                    e.target.style.borderColor = '#68f91a';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'rgba(104, 249, 26, 0.5)';
                }}
              >
                {loading ? 'Sending...' : 'Resend OTP'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default YathrikaSignin;