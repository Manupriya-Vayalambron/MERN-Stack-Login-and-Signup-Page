import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Eco-Friendly Water Bottle',
      malayalamName: 'പരിസ്ഥിതി സൗഹൃദ കുപ്പി',
      quantity: 2,
      price: 299,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp8o75HkwMhNSa9X37Rt5h9PWJXSaWN8uVaFgcjY1Wdk85IKZF_Qdgjf293anwPGhzjxlDJzPjm6p4Xug58zOx0nfzXMsyo1nIpg4xHy2zMU4TSO5hCaVFY0zAN-5RvWWWtngISaRNDZbXdZoSQgY65XleSWyGW4ON1jz-62rN2hLKxcamPW9_VmRe1_2X-z98_fejmCXFsSy84CzBHa-ItoevoIEuRdMWZ4NNSJW9jpFZVJQjy-MIwzyHIRrCVc1P6v07Pr7OM1M'
    },
    {
      id: 2,
      name: 'Organic Cotton T-Shirt',
      malayalamName: 'ഓർഗാനിക് കോട്ടൺ ടി-ഷർട്ട്',
      quantity: 1,
      price: 599,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCALnSEXms__1aOj50zX0w22DTJVxt7QF3u7okf8lZeGyaFg9iaCHS8Uji2JoSDS87DtviT5biL9lo1ateDiAIIEvg78bqntAFY2p4jBtqKMIsWUnl1F8kGSqDAXheLeZY1oijO2ZHgbe2FTtjfrMhdygqR_6DW3X0p9hIA7ZOu_AljrVm-Xc5CFGau7T2ckD5ccpBndHX_Y3Y1uaY6q_CpHqb-Bwo6f8i_-Ou-J7ywNS_DcesAj5wOLpBvQLmoF29geTD018rgRcA'
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="main-wrapper">
      <div className="flex-grow">
        <header className="header">
          <Link to="/yathrika-home" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-white">എന്റെ കാർട്ട് (Cart)</h1>
          <div className="size-10"></div>
        </header>

        <main className="p-4">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl bg-white/5 p-4 glow-shadow">
                <div 
                  className="aspect-square size-20 shrink-0 rounded-lg bg-cover bg-center" 
                  style={{backgroundImage: `url("${item.image}")`}}
                ></div>
                <div className="flex-grow">
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="text-sm text-white/70">{item.malayalamName}</p>
                  <p className="text-sm text-primary">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Section */}
          <div className="mt-8 flex items-end gap-2">
            <div className="flex-grow">
              <label className="mb-1 block text-sm font-medium text-white/70" htmlFor="coupon">കൂപ്പൺ കോഡ്</label>
              <input 
                className="glow-input w-full rounded-lg border-2 border-white/10 bg-white/5 p-3 text-white placeholder-white/50 focus:border-primary focus:ring-0" 
                id="coupon" 
                placeholder="Enter coupon code" 
                type="text"
              />
            </div>
            <button className="h-12 rounded-lg bg-primary/30 px-6 font-bold text-primary hover:bg-primary/40 glow-shadow">Apply</button>
          </div>

          {/* Price Details */}
          <div className="mt-8 rounded-xl bg-white/5 p-4 glow-shadow">
            <h2 className="mb-4 text-lg font-bold text-white">Price Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-white/70">
                <p>Subtotal</p>
                <p>₹{getTotalPrice()}</p>
              </div>
              <div className="flex justify-between text-white/70">
                <p>Delivery Fee</p>
                <p>₹40</p>
              </div>
              <div className="flex justify-between text-white/70">
                <p>Discount</p>
                <p className="text-primary/80">-₹20</p>
              </div>
              <div className="my-2 border-t border-white/10"></div>
              <div className="flex justify-between text-lg font-bold text-white">
                <p>Total (ആകെ)</p>
                <p>₹{getTotalPrice() + 40 - 20}</p>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="mt-8">
            <Link 
              to="/order-summary"
              className="glow-effect flex w-full cursor-pointer items-center justify-center rounded-xl bg-primary py-4 text-lg font-bold tracking-wider text-background-dark hover:bg-primary/90 transition-all duration-300"
            >
              <span>Proceed to Checkout</span>
            </Link>
          </div>
        </main>
      </div>

      <footer className="footer-nav">
        <nav className="nav-container">
          <Link className="nav-item active" to="/yathrika-home">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
            </svg>
            <span className="nav-text">Home</span>
          </Link>
          <Link className="nav-item" to="/order-history">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M247.42,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,247.42,117ZM184,88h34.58l9.6,24H184ZM24,72H168v64H24ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm81-24H103a32,32,0,0,0-62,0H24V152H168v12.31A32.11,32.11,0,0,0,153,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,184,208Zm48-24H215a32.06,32.06,0,0,0-31-24V128h48Z"></path>
            </svg>
            <span className="nav-text">Orders</span>
          </Link>
          <Link className="nav-item" to="/user-profile">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
            </svg>
            <span className="nav-text">Profile</span>
          </Link>
          <Link className="nav-item" to="/notifications">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
            <span className="nav-text">Notifications</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Cart;