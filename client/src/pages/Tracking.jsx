import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Tracking = () => {
  const [timeRemaining, setTimeRemaining] = useState({
    minutes: 15,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const orderDetails = {
    id: '#1234567890',
    items: 2,
    total: 250,
    deliveryLocation: 'Kochi Bus Stop'
  };

  const trackingStages = [
    { name: 'CONFIRMED', active: true },
    { name: 'PACKED', active: false },
    { name: 'PARTNER AT STOP', active: false },
    { name: 'HANDOVER', active: false }
  ];

  return (
    <div className="main-wrapper">
      <div className="flex-grow">
        <header className="flex items-center p-4">
          <Link to="/order-history" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-light dark:bg-primary/20 text-black dark:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="flex-1 text-center text-lg font-bold text-black dark:text-white pr-10">Order Tracking</h1>
        </header>
        
        <main className="p-4">
          <div className="rounded-xl bg-primary/10 dark:bg-primary/20 p-6 space-y-6 glow-shadow">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-black dark:text-white">
                {trackingStages.map((stage, index) => (
                  <span key={index} className={stage.active ? 'text-primary' : 'text-black/60 dark:text-white/60'}>
                    {stage.name}
                  </span>
                ))}
              </div>
              <div className="relative h-2 rounded-full bg-primary/20">
                <div className="absolute h-2 rounded-full bg-primary glow-effect" style={{width: '25%'}}></div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-black dark:text-white">Order Confirmed</h2>
              <p className="text-sm text-black/60 dark:text-white/60">Your order has been confirmed and is being prepared.</p>
            </div>
          </div>
          
          <div className="py-8">
            <p className="text-center mb-4 text-sm text-black/60 dark:text-white/60">Your order will arrive at the bus stop in:</p>
            <div className="flex justify-center gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 glow-shadow">
                  <p className="text-5xl font-bold text-primary">{timeRemaining.minutes}</p>
                </div>
                <p className="mt-2 text-sm font-medium text-black/80 dark:text-white/80">Minutes</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 glow-shadow">
                  <p className="text-5xl font-bold text-primary">{timeRemaining.seconds}</p>
                </div>
                <p className="mt-2 text-sm font-medium text-black/80 dark:text-white/80">Seconds</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black dark:text-white">Order Details</h3>
            <div className="rounded-lg bg-background-light dark:bg-primary/10 p-4 space-y-4 glow-shadow">
              <div className="flex justify-between">
                <p className="text-sm text-black/60 dark:text-white/60">Order ID</p>
                <p className="text-sm font-medium text-black dark:text-white">{orderDetails.id}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-black/60 dark:text-white/60">Items</p>
                <p className="text-sm font-medium text-black dark:text-white">{orderDetails.items} items</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-black/60 dark:text-white/60">Total</p>
                <p className="text-sm font-medium text-black dark:text-white">₹ {orderDetails.total}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-bold text-black dark:text-white">Delivery</h3>
            <div className="rounded-lg bg-background-light dark:bg-primary/10 p-4 glow-shadow">
              <div className="flex justify-between">
                <p className="text-sm text-black/60 dark:text-white/60">Delivery Location</p>
                <p className="text-sm font-medium text-black dark:text-white">{orderDetails.deliveryLocation}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <footer className="footer-nav">
        <div className="flex justify-around items-center h-20 px-4 pb-3 pt-2">
          <Link className="flex flex-col items-center justify-center gap-1 text-black/60 dark:text-white/60" to="/yathrika-home">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs">Home</span>
          </Link>
          <Link className="flex flex-col items-center justify-center gap-1 text-primary" to="/order-history">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-xs">Orders</span>
          </Link>
          <Link className="flex flex-col items-center justify-center gap-1 text-black/60 dark:text-white/60" to="/user-profile">
            <span className="material-symbols-outlined">person</span>
            <span className="text-xs">Profile</span>
          </Link>
          <Link className="flex flex-col items-center justify-center gap-1 text-black/60 dark:text-white/60" to="/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="text-xs">Notifications</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Tracking;