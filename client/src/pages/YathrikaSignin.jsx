import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';
import '../index.css';

// ─── How long the resend button is disabled after sending (seconds) ───────────
const RESEND_COOLDOWN_SEC = 30;

// ─── Translate raw Firebase/network errors into human-friendly messages ───────
// Never show Firebase error codes or "check your internet" to the user.
const toFriendlyError = (err) => {
  const code = err?.code || '';
  const msg  = (err?.message || '').toLowerCase();

  if (code === 'auth/too-many-requests')
    return 'Too many attempts for this number. Please wait a few minutes before trying again.';
  if (code === 'auth/invalid-phone-number')
    return 'Please enter a valid 10-digit Indian mobile number.';
  if (code === 'auth/invalid-verification-code' || code === 'auth/invalid-verification-id')
    return 'Incorrect OTP. Please double-check and try again.';
  if (code === 'auth/code-expired')
    return 'This OTP has expired. Please request a new one.';
  if (code === 'auth/session-expired')
    return 'Your session has expired. Please request a new OTP.';
  if (code === 'auth/captcha-check-failed')
    return 'Verification check failed. Please try again.';
  if (code === 'auth/web-storage-unsupported')
    return 'Please enable cookies in your browser settings and try again.';
  if (code === 'auth/network-request-failed' || msg.includes('network') || msg.includes('failed to fetch'))
    return 'Connection issue. Please check your internet and try again.';
  if (code === 'auth/missing-phone-number')
    return 'Phone number is missing. Please go back and re-enter it.';
  // Fallback — never expose raw Firebase messages
  return 'Something went wrong. Please try again.';
};

const YathrikaSignin = () => {
  const [phoneNumber,        setPhoneNumber]        = useState('');
  const [showOtpModal,       setShowOtpModal]        = useState(false);
  const [otp,                setOtp]                 = useState(['', '', '', '', '', '']);
  const [error,              setError]               = useState('');
  const [loading,            setLoading]             = useState(false);
  const [confirmationResult, setConfirmationResult]  = useState(null);
  const [resendCooldown,     setResendCooldown]      = useState(0);
  const [resendSuccess,      setResendSuccess]       = useState(false);

  const navigate     = useNavigate();
  const { language } = useLanguage();
  const { signIn }   = useUser();

  // ── Single stable ref for reCAPTCHA — NEVER recreated unless explicitly destroyed
  // This is the core fix for "too many attempts": Firebase counts every new
  // RecaptchaVerifier instance as a separate rate-limited attempt on that number.
  const recaptchaRef  = useRef(null);
  const cooldownRef   = useRef(null);
  const mountedRef    = useRef(true);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearInterval(cooldownRef.current);
      _destroyRecaptcha();
    };
  }, []);

  // ── Internal: destroy existing reCAPTCHA cleanly ──────────────────────────
  const _destroyRecaptcha = () => {
    if (recaptchaRef.current) {
      try { recaptchaRef.current.clear(); } catch (_) {}
      recaptchaRef.current     = null;
      window.recaptchaVerifier = null;
    }
    const el = document.getElementById('recaptcha-container');
    if (el) el.innerHTML = '';
  };

  // ── Internal: get existing verifier or create a new one ───────────────────
  // Creating reCAPTCHA is expensive — reuse if already created.
  const _getVerifier = useCallback(() => {
    if (recaptchaRef.current) return recaptchaRef.current;

    try {
      const v = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback:           () => {},
        'expired-callback': () => { _destroyRecaptcha(); },
        'error-callback':   () => { _destroyRecaptcha(); },
      });
      recaptchaRef.current     = v;
      window.recaptchaVerifier = v;
      return v;
    } catch (err) {
      console.error('RecaptchaVerifier init failed:', err);
      return null;
    }
  }, []);

  // ── Start resend cooldown countdown ──────────────────────────────────────
  const _startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SEC);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Core: request OTP from Firebase ──────────────────────────────────────
  // Used by both first-send and resend — single code path.
  const _requestOtp = async () => {
    const verifier = _getVerifier();
    if (!verifier) throw { code: 'auth/captcha-check-failed' };

    const formattedPhone = '+91' + phoneNumber;
    // signInWithPhoneNumber returns a confirmationResult we MUST keep.
    // IMPORTANT: do NOT touch the verifier after this call succeeds.
    const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    return result;
  };

  // ── Handle phone number form submit ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || phoneNumber.length !== 10 || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const result = await _requestOtp();
      if (!mountedRef.current) return;
      setConfirmationResult(result);
      setShowOtpModal(true);
      _startCooldown();
    } catch (err) {
      console.error('Send OTP error:', err?.code, err?.message);
      if (!mountedRef.current) return;
      // Only destroy verifier on non-rate-limit errors —
      // destroying on rate-limit makes Firebase angrier.
      if (err?.code !== 'auth/too-many-requests') _destroyRecaptcha();
      setError(toFriendlyError(err));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const next = [...otp];
      next[index] = value;
      setOtp(next);
      setError('');
      if (value && index < 5) document.getElementById(`signin-otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`signin-otp-${index - 1}`)?.focus();
    }
  };

  // Allow pasting a full 6-digit OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(''));
      document.getElementById('signin-otp-5')?.focus();
    }
  };

  // ── Verify OTP then save user to MongoDB ──────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    if (!confirmationResult) {
      setError('Session expired. Please close this and request a new OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ── Step 1: Verify OTP with Firebase (pure auth, no network to our server) ──
      await confirmationResult.confirm(enteredOtp);
      console.log('✅ Firebase OTP verified successfully');

      // ── Step 2: Save / retrieve user from MongoDB with automatic retry ────────
      // This step failing previously caused the "OTP verified but error" bug.
      // Now it retries 3× with exponential backoff and navigates regardless.
      const formattedPhone = '+91' + phoneNumber;
      let dbResult = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          dbResult = await signIn(formattedPhone, { name: '' });
          if (dbResult?.success) break;
        } catch (dbErr) {
          console.warn(`MongoDB attempt ${attempt}/3 failed:`, dbErr?.message);
          // Wait before retry: 600ms, 1200ms, 1800ms
          if (attempt < 3) await new Promise(r => setTimeout(r, 600 * attempt));
        }
      }

      if (!mountedRef.current) return;

      if (dbResult?.success) {
        console.log('✅ User saved to MongoDB:', dbResult.user);
      } else {
        // Firebase auth succeeded — user IS authenticated.
        // A MongoDB failure must NOT block the user from using the app.
        console.warn('⚠️ MongoDB save failed after 3 attempts — proceeding anyway');
      }

      // ── Step 3: Navigate — always, regardless of MongoDB result ──────────────
      _destroyRecaptcha();
      clearInterval(cooldownRef.current);
      navigate('/routes');

    } catch (err) {
      console.error('OTP verify error:', err?.code, err?.message);
      if (!mountedRef.current) return;

      setError(toFriendlyError(err));

      // Only clear OTP boxes for wrong-code errors — keep them for other errors
      // so the user doesn't have to retype if it was a network blip
      if (err?.code === 'auth/invalid-verification-code' ||
          err?.code === 'auth/invalid-verification-id') {
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => document.getElementById('signin-otp-0')?.focus(), 50);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    setResendSuccess(false);
    setLoading(true);

    try {
      // Reuse existing verifier — do NOT destroy before resend.
      // A fresh verifier on every resend is the #1 cause of "too many requests."
      const result = await _requestOtp();
      if (!mountedRef.current) return;
      setConfirmationResult(result);
      setResendSuccess(true);
      _startCooldown();
      setTimeout(() => { if (mountedRef.current) setResendSuccess(false); }, 3000);
    } catch (err) {
      console.error('Resend OTP error:', err?.code, err?.message);
      if (!mountedRef.current) return;
      if (err?.code !== 'auth/too-many-requests') _destroyRecaptcha();
      setError(toFriendlyError(err));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowOtpModal(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setResendSuccess(false);
    // Do NOT destroy reCAPTCHA — user may click Continue again immediately
  };

  // ─── Render ───────────────────────────────────────────────────────────────
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
            <h2 className="signin-welcome-title">
              {language === 'en' ? 'Welcome' : 'സ്വാഗതം'}
            </h2>
            <p className="signin-instruction-text">
              {language === 'en'
                ? 'Enter your phone number to sign in'
                : 'സൈൻ ഇൻ ചെയ്യാൻ നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകുക'}
            </p>
          </div>

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="signin-input-container">
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#68f91a', fontSize: '16px', fontWeight: '500'
                }}>
                  +91
                </span>
                <input
                  className="signin-phone-input"
                  placeholder={language === 'en' ? 'Phone Number' : 'ഫോൺ നമ്പർ'}
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  maxLength={10}
                  style={{ paddingLeft: '50px' }}
                  autoComplete="tel"
                />
              </div>
            </div>

            {error && !showOtpModal && (
              <p style={{
                color: '#ef4444', fontSize: '14px',
                marginBottom: '10px', textAlign: 'center'
              }}>
                {error}
              </p>
            )}

            <button
              className="signin-continue-button"
              type="submit"
              disabled={loading || phoneNumber.length !== 10}
              style={{
                opacity: (loading || phoneNumber.length !== 10) ? 0.7 : 1,
                cursor:  (loading || phoneNumber.length !== 10) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
          </form>

          {/* reCAPTCHA — permanently hidden off-screen, NEVER repositioned */}
          <div
            id="recaptcha-container"
            style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}
          />
        </div>
      </main>

      <footer className="signin-footer">
        <p className="signin-terms-text">
          By continuing, you agree to our{' '}
          <Link className="signin-link" to="/terms">Terms of Service</Link> and{' '}
          <Link className="signin-link" to="/privacy">Privacy Policy</Link>.
        </p>
      </footer>

      {/* ── OTP Modal ── */}
      {showOtpModal && (
        <div className="otp-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(22, 35, 15, 0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(8px)'
        }}>
          <div className="otp-modal-container" style={{
            backgroundColor: 'rgba(22, 35, 15, 0.95)',
            borderRadius: '12px', padding: '24px',
            width: '90%', maxWidth: '400px', position: 'relative',
            border: '1px solid rgba(104, 249, 26, 0.3)',
            boxShadow: '0 0 30px rgba(104, 249, 26, 0.2)',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'none', border: 'none',
                color: 'rgba(104, 249, 26, 0.8)',
                cursor: 'pointer', fontSize: '20px', fontWeight: 'bold'
              }}
            >✕</button>

            <h2 style={{
              color: '#fff', textAlign: 'center', marginBottom: '8px',
              fontSize: '1.5rem', fontWeight: 'bold',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              Enter OTP
            </h2>
            <p style={{
              color: 'rgb(209, 213, 219)', textAlign: 'center',
              marginBottom: '24px', fontSize: '14px',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              A 6-digit OTP has been sent to +91 {phoneNumber}
            </p>

            {/* Resend success toast */}
            {resendSuccess && (
              <p style={{
                color: '#68f91a', textAlign: 'center', fontSize: '13px',
                marginBottom: '12px', fontWeight: 600
              }}>
                ✓ New OTP sent successfully
              </p>
            )}

            <form onSubmit={handleOtpSubmit}>
              <div style={{
                display: 'flex', justifyContent: 'center',
                gap: '8px', marginBottom: '16px'
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
                    onPaste={index === 0 ? handlePaste : undefined}
                    style={{
                      width: '42px', height: '50px',
                      textAlign: 'center', fontSize: '22px', fontWeight: 'bold',
                      border: '2px solid rgba(104, 249, 26, 0.3)',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(22, 35, 15, 0.7)',
                      color: '#68f91a', outline: 'none',
                      fontFamily: "'Space Grotesk', sans-serif",
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow   = '0 0 15px 2px rgba(104, 249, 26, 0.5)';
                      e.target.style.borderColor = '#68f91a';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow   = 'none';
                      e.target.style.borderColor = 'rgba(104, 249, 26, 0.3)';
                    }}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <p style={{
                  color: '#ef4444', textAlign: 'center',
                  fontSize: '14px', marginBottom: '16px',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                style={{
                  width: '100%', padding: '14px',
                  backgroundColor: '#68f91a', color: '#16230f',
                  border: 'none', borderRadius: '8px',
                  fontSize: '16px', fontWeight: 'bold',
                  cursor: (loading || otp.join('').length !== 6) ? 'not-allowed' : 'pointer',
                  marginBottom: '12px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: '0 0 20px rgba(104, 249, 26, 0.5)',
                  transition: 'all 0.3s ease',
                  opacity: (loading || otp.join('').length !== 6) ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = 'rgba(104, 249, 26, 0.9)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#68f91a';
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              {/* Resend button with cooldown timer */}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendCooldown > 0}
                style={{
                  width: '100%', padding: '12px',
                  backgroundColor: 'transparent', color: '#68f91a',
                  border: '2px solid rgba(104, 249, 26, 0.5)',
                  borderRadius: '8px', fontSize: '14px',
                  cursor: (loading || resendCooldown > 0) ? 'not-allowed' : 'pointer',
                  opacity: (loading || resendCooldown > 0) ? 0.6 : 1,
                  fontFamily: "'Space Grotesk', sans-serif",
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (!loading && resendCooldown === 0) {
                    e.currentTarget.style.backgroundColor = 'rgba(104, 249, 26, 0.1)';
                    e.currentTarget.style.borderColor     = '#68f91a';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor     = 'rgba(104, 249, 26, 0.5)';
                }}
              >
                {resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : loading ? 'Sending...' : 'Resend OTP'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default YathrikaSignin;