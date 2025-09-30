import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const OTP = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  
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
  };

  return (
    <div className="flex flex-col min-h-screen justify-between p-4 bg-background-light dark:bg-background-dark font-display text-white">
      <header className="flex items-center justify-between">
        <Link to="/yathrika-signin" className="text-gray-900 dark:text-white">
          <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-center flex-grow text-gray-900 dark:text-white">OTP Verification</h1>
        <div className="w-6"></div>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center text-center -mt-16">
        <div className="w-full max-w-sm p-6 bg-background-light dark:bg-background-dark/50 backdrop-blur-sm border border-white/10 dark:border-white/10 rounded-xl">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary">sms</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enter OTP</h2>
            <p className="text-gray-600 dark:text-gray-300">We sent a code to your phone</p>
            <p className="text-gray-600 dark:text-gray-300 mt-1">+91 98765 43210</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-14 h-14 text-center text-2xl font-bold bg-background-dark/50 dark:bg-background-dark/70 border-2 border-white/20 dark:border-white/10 focus:outline-none focus:border-primary focus:ring-0 rounded-lg text-white transition-colors"
                />
              ))}
            </div>
            
            <button 
              className="w-full h-14 bg-primary text-background-dark font-bold rounded-lg glow-effect hover:bg-primary/90 transition-all duration-300" 
              type="submit"
            >
              Verify OTP
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Didn't receive the code?{' '}
                <button className="text-primary hover:text-primary/80 font-semibold">
                  Resend
                </button>
              </p>
            </div>
          </form>
        </div>
      </main>

      <footer className="text-center pb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By continuing, you agree to our{' '}
          <Link className="text-primary/80 hover:text-primary" to="/terms">Terms of Service</Link> and{' '}
          <Link className="text-primary/80 hover:text-primary" to="/privacy">Privacy Policy</Link>.
        </p>
      </footer>
    </div>
  );
};

export default OTP;