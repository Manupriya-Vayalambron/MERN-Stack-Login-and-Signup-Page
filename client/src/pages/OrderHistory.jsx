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
    <div className="order-history-page-container">
      <div className="order-history-content-wrapper">
        <header className="order-history-header">
          <div className="order-history-header-inner">
            <Link to="/yathrika-home" className="order-history-back-button">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="order-history-page-title">Orders</h1>
            <div className="order-history-header-spacer"></div>
          </div>
          <div className="order-history-tabs-section">
            <nav className="order-history-tabs-nav">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`order-history-tab ${
                    activeTab === tab
                      ? 'order-history-tab-active'
                      : 'order-history-tab-inactive'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="order-history-main-content">
          {orders.map((order) => (
            <div key={order.id} className="order-history-card">
              <div className="order-history-card-content">
                <div className="order-history-details">
                  <p className="order-history-status">{order.status}</p>
                  <p className="order-history-order-number">Order #{order.id}</p>
                  <p className="order-history-meta">{order.items} items • {order.date}</p>
                  <button className="order-history-reorder-button">
                    Reorder
                    <span className="material-symbols-outlined">refresh</span>
                  </button>
                </div>
                <div className="order-history-image-container">
                  <img 
                    alt="Order Image" 
                    className="order-history-image" 
                    src={order.image}
                  />
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>

      <footer className="order-history-footer-nav">
        <nav className="order-history-nav-container">
          <Link className="order-history-nav-item" to="/yathrika-home">
            <span className="material-symbols-outlined">home</span>
            <span className="order-history-nav-text">Home</span>
          </Link>
          <Link className="order-history-nav-item order-history-nav-active" to="/order-history">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="order-history-nav-text">Orders</span>
          </Link>
          <Link className="order-history-nav-item" to="/user-profile">
            <span className="material-symbols-outlined">person</span>
            <span className="order-history-nav-text">Profile</span>
          </Link>
          <Link className="order-history-nav-item" to="/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="order-history-nav-text">Notifications</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default OrderHistory;