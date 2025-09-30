import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const YathrikaSignin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signin logic here
    console.log('Phone number:', phoneNumber);
  };

  return (
    <div className="flex flex-col min-h-screen justify-between p-4 bg-background-light dark:bg-background-dark text-white">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-center flex-grow text-gray-900 dark:text-white">Yathrika</h1>
        <button className="flex items-center justify-center p-2 rounded-full text-gray-900 dark:text-white hover:bg-primary/20 dark:hover:bg-primary/30">
          <span className="material-symbols-outlined">language</span>
        </button>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center text-center -mt-16">
        <div className="w-full max-w-sm p-6 bg-background-light dark:bg-background-dark/50 backdrop-blur-sm border border-white/10 dark:border-white/10 rounded-xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Enter your phone number to sign in</p>
            <p className="text-gray-600 dark:text-gray-300 mt-1">നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകുക</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <input 
                className="glow-input w-full h-14 bg-background-dark/50 dark:bg-background-dark/70 border-2 border-white/20 dark:border-white/10 focus:outline-none focus:ring-0 rounded-lg p-4 text-white placeholder-gray-400 dark:placeholder-gray-500 transition-shadow duration-300" 
                placeholder="Phone Number" 
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <button 
              className="w-full h-14 bg-primary text-background-dark font-bold rounded-lg shadow-[0_0_20px_theme('colors.primary/50%')] hover:bg-primary/90 transition-all duration-300" 
              type="submit"
            >
              Continue
            </button>
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

export default YathrikaSignin;