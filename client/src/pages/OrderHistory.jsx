import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const OrderHistory = () => {
  const [activeTab, setActiveTab] = useState('Food');
  
  const orders = [
    {
      id: '1234567890',
      status: 'Delivered',
      items: 2,
      date: '12/12/2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgJYPfYx4Qswfa1xEunByEnbMtxCizy6P42YwzwbX9atn2LIkn_a-3y_om_C2OglA3KRb3SfHgQJvKAts3wgU9ePGTqJ_uC-scHxIGwEQfvNJwizh61PppsKJSlVKvI_ECvl_44J8ldHLvvJOQ7irLskzcDqs6Kk0B2RCK1i621fCQJO2niUPoIDyUb2zBucHYc5xqPSFMSEyDXjBDch4Pxvb1C_9Cdf6Uclqy3Zr_r4x9VdIKNk2qDjbnY1LKT5A1DvviHbKNKl8'
    },
    {
      id: '9876543210',
      status: 'Delivered',
      items: 3,
      date: '11/25/2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOu7ZvODDIrGOMlo8mNQDKEayQn-92dhtGYhh0WsOJBrlxaQAXhLWkoyJ16y4aU-rcD65LUmt95BswB8oOMK-nQ3JjN9fQrbQh_jtqJRRYyKxsvEOgt7_Pk9UB-mHUShmBslsNWgMthshPTxquN1NbHm6Qy9Nr5HuAQ3ryXmxeLl93KMmLY3n8TtI4d7FQpTaQJ6BR-yWrIjErMSo7eRf-PtO_T95AKg_f6i3bEdL2bnRfVdqVqKeQVDBCWLqY4z2SnVPFMK_L754'
    },
    {
      id: '5678901234',
      status: 'Delivered',
      items: 1,
      date: '11/10/2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSk7QubbQdxzfXCA0rcOID1JID1YXVM232WuwHx5rqw4fH0hPWK7-mHybaihVBBokYl234hlZr5ku5pmvcJC0oYWwjnHbz712E0FSQ3kWokA-W4_gGNfG5xfg2dxVi65NRtchMGrb8ZXIRhiV97jPMuNx-WeeJ6ATB24AY3eVs6MS0G_z1D2rUToKBMlsmN3rSOfnw_jZlzMkbQDfuM8VpxbmwMxFTi3DSAmBzI_reekblpRCwA2fhhm2KPkaNL1wXWQpsVF4B3mI'
    }
  ];

  const tabs = ['Food', 'Medicines', 'Essentials'];

  return (
    <div className="main-wrapper">
      <div>
        <header className="header">
          <div className="flex items-center p-4">
            <Link to="/yathrika-home" className="text-gray-600 dark:text-gray-400">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="header-title pr-6">Orders</h1>
          </div>
          <div className="border-b border-gray-200/20 dark:border-gray-700/50 px-4">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 whitespace-nowrap border-b-2 py-3 text-center text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'border-primary font-bold text-primary'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:border-primary/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-background-light dark:bg-primary/10 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{order.status}</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-1">Order #{order.id}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{order.items} items • {order.date}</p>
                  <button className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white glow-effect hover:bg-primary/90 transition-all duration-300">
                    Reorder
                    <span className="material-symbols-outlined text-base">refresh</span>
                  </button>
                </div>
                <div className="w-24 h-24 flex-shrink-0">
                  <img 
                    alt="Order Image" 
                    className="w-full h-full object-cover rounded-lg" 
                    src={order.image}
                  />
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>

      <footer className="footer-nav">
        <nav className="nav-container">
          <Link className="nav-item" to="/yathrika-home">
            <span className="material-symbols-outlined nav-icon">home</span>
            <span className="nav-text">Home</span>
          </Link>
          <Link className="nav-item active" to="/order-history">
            <span className="material-symbols-outlined nav-icon">receipt_long</span>
            <span className="nav-text">Orders</span>
          </Link>
          <Link className="nav-item" to="/user-profile">
            <span className="material-symbols-outlined nav-icon">person</span>
            <span className="nav-text">Profile</span>
          </Link>
          <Link className="nav-item" to="/notifications">
            <span className="material-symbols-outlined nav-icon">notifications</span>
            <span className="nav-text">Notifications</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default OrderHistory;