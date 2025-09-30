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
    <div className="relative flex h-screen w-full flex-col items-center justify-center p-6 text-center bg-background-light dark:bg-background-dark font-display">
      <div className="flex-grow flex flex-col items-center justify-center space-y-4">
        <svg 
          className="w-32 h-32 text-primary" 
          style={{
            filter: 'drop-shadow(0 0 10px theme("colors.primary")) drop-shadow(0 0 20px theme("colors.primary"))',
            animation: 'pulse-glow 3s infinite ease-in-out'
          }}
          fill="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C15.87 2 19 5.13 19 9C19 14.25 12 22 12 22S5 14.25 5 9C5 5.13 8.13 2 12 2ZM12 11.5C13.38 11.5 14.5 10.38 14.5 9C14.5 7.62 13.38 6.5 12 6.5C10.62 6.5 9.5 7.62 9.5 9C9.5 10.38 10.62 11.5 12 11.5Z"></path>
        </svg>
        <h1 className="text-4xl font-bold text-black dark:text-white">Yathrika</h1>
        <p className="text-lg text-black/70 dark:text-white/70">Seamless. Convenient. Kerala.</p>
      </div>
      
      <div className="w-full">
        <div className="flex w-full flex-row items-center justify-center gap-2 py-6">
          <div className="h-2.5 w-6 rounded-full bg-primary"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-primary/30"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-primary/30"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-primary/30"></div>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white leading-tight">Easy Ordering</h2>
          <p className="text-base text-black/70 dark:text-white/70 mt-2 px-4">Your trusted partner for seamless delivery across Kerala.</p>
        </div>
      </div>
      
      <div className="w-full px-4 pb-4">
        <button 
          onClick={handleGetStarted}
          className="w-full h-14 rounded-xl bg-primary text-background-dark font-bold text-lg tracking-wide glow-effect transition-transform duration-300 ease-in-out hover:scale-105"
        >
          Get Started
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 10px #68f91a) drop-shadow(0 0 20px #68f91a);
          }
          50% {
            filter: drop-shadow(0 0 15px #68f91a) drop-shadow(0 0 35px #68f91a);
          }
        }
      `}</style>
    </div>
  );
};

export default Splash;