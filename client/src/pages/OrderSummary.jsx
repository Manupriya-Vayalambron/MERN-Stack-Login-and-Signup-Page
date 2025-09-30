import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const OrderSummary = () => {
  const orderItems = [
    {
      name: 'Organic Vegetables',
      malayalamName: 'ഓർഗാനിക് പച്ചക്കറികൾ',
      quantity: 2,
      price: 150,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp8o75HkwMhNSa9X37Rt5h9PWJXSaWN8uVaFgcjY1Wdk85IKZF_Qdgjf293anwPGhzjxlDJzPjm6p4Xug58zOx0nfzXMsyo1nIpg4xHy2zMU4TSO5hCaVFY0zAN-5RvWWWtngISaRNDZbXdZoSQgY65XleSWyGW4ON1jz-62rN2hLKxcamPW9_VmRe1_2X-z98_fejmCXFsSy84CzBHa-ItoevoIEuRdMWZ4NNSJW9jpFZVJQjy-MIwzyHIRrCVc1P6v07Pr7OM1M'
    },
    {
      name: 'Fresh Fruits',
      malayalamName: 'പുതിയ പഴങ്ങൾ',
      quantity: 1,
      price: 200,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCALnSEXms__1aOj50zX0w22DTJVxt7QF3u7okf8lZeGyaFg9iaCHS8Uji2JoSDS87DtviT5biL9lo1ateDiAIIEvg78bqntAFY2p4jBtqKMIsWUnl1F8kGSqDAXheLeZY1oijO2ZHgbe2FTtjfrMhdygqR_6DW3X0p9hIA7ZOu_AljrVm-Xc5CFGau7T2ckD5ccpBndHX_Y3Y1uaY6q_CpHqb-Bwo6f8i_-Ou-J7ywNS_DcesAj5wOLpBvQLmoF29geTD018rgRcA'
    }
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 25;
  const total = subtotal + deliveryFee;

  return (
    <div className="main-wrapper">
      <div className="flex-grow">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light/80 p-4 backdrop-blur-sm dark:bg-background-dark/80">
          <Link to="/cart" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-white">Order Summary</h1>
          <div className="size-10"></div>
        </header>

        <main className="p-4 space-y-6">
          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="text-lg font-bold text-white mb-4">Items</h2>
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg bg-cover bg-center" 
                    style={{backgroundImage: `url("${item.image}")`}}
                  ></div>
                  <div className="flex-grow">
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-sm text-white/70">{item.malayalamName}</p>
                    <p className="text-sm text-white/60">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="text-lg font-bold text-white mb-4">Delivery Details</h2>
            <div className="space-y-2 text-sm">
              <p className="text-white/70">Delivery to: <span className="text-white">Home</span></p>
              <p className="text-white/70">Address: <span className="text-white">123 Main Street, Kochi</span></p>
              <p className="text-white/70">Estimated Time: <span className="text-white">30-45 minutes</span></p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="text-lg font-bold text-white mb-4">Payment Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="border-t border-white/20 pt-2 flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="footer-nav p-4">
        <button className="w-full h-14 bg-primary text-background-dark font-bold rounded-lg glow-effect hover:bg-primary/90 transition-all duration-300 flex items-center justify-center">
          Place Order - ₹{total}
        </button>
      </footer>
    </div>
  );
};

export default OrderSummary;