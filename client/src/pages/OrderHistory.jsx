import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';
import '../index.css';

const OrderHistory = () => {
  const { language } = useLanguage();
  const { user, getUserOrders, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState('Food');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        // Refresh user data to get latest orders
        await refreshUser();
        
        // Get user orders
        const userOrders = getUserOrders();
        
        // Transform orders to match the display format
        const transformedOrders = userOrders.map((order) => ({
          id: order.orderId,
          status: order.paymentStatus === 'success' 
            ? (language === 'en' ? 'Delivered' : 'വിതരണം ചെയ്തു')
            : (language === 'en' ? 'Failed' : 'കുറ്റമുണ്ട്'),
          items: order.items?.length || 0,
          date: new Date(order.orderDate).toLocaleDateString('en-GB'),
          amount: order.totalAmount,
          paymentId: order.paymentId,
          image: order.items?.[0]?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgJYPfYx4Qswfa1xEunByEnbMtxCizy6P42YwzwbX9atn2LIkn_a-3y_om_C2OglA3KRb3SfHgQJvKAts3wgU9ePGTqJ_uC-scHxIGwEQfvNJwizh61PppsKJSlVKvI_ECvl_44J8ldHLvvJOQ7irLskzcDqs6Kk0B2RCK1i621fCQJO2niUPoIDyUb2zBucHYc5xqPSFMSEyDXjBDch4Pxvb1C_9Cdf6Uclqy3Zr_r4x9VdIKNk2qDjbnY1LKT5A1DvviHbKNKl8'
        }));
        
        setOrders(transformedOrders.reverse()); // Show newest first
      } catch (error) {
        console.error('Failed to load orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user, refreshUser, getUserOrders, language]);

  const tabs = [
    { key: 'Food', label: language === 'en' ? 'Food' : 'ഭക്ഷണം' },
    { key: 'Medicines', label: language === 'en' ? 'Medicines' : 'മരുന്നുകൾ' },
    { key: 'Essentials', label: language === 'en' ? 'Essentials' : 'അത്യാവശ്യങ്ങൾ' }
  ];

  return (
    <div className="order-history-page-container">
      <div className="order-history-content-wrapper">
        <header className="order-history-header">
          <div className="order-history-header-inner flex justify-between items-center px-4">
            <Link to="/yathrika-home" className="order-history-back-button">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="order-history-page-title">{language === 'en' ? 'Orders' : 'ഓർഡറുകൾ'}</h1>
            <div className="header-placeholder" />
          </div>
          <div className="order-history-tabs-section">
            <nav className="order-history-tabs-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`order-history-tab ${
                    activeTab === tab.key
                      ? 'order-history-tab-active'
                      : 'order-history-tab-inactive'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="order-history-main-content">
          {!user && (
            <div className="order-history-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p className="order-history-status">
                {language === 'en' ? 'Please sign in to view your orders' : 'നിങ്ങൾും ഓർഡറുകൾ കാണാൻ സൈൻ ഇൻ ചെയ്യുക'}
              </p>
              <Link to="/yathrika-signin" className="order-history-reorder-button" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
                {language === 'en' ? 'Sign In' : 'സൈൻ ഇൻ'}
              </Link>
            </div>
          )}
          
          {user && loading && (
            <div className="order-history-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p className="order-history-status">
                {language === 'en' ? 'Loading your orders...' : 'നിങ്ങൾും ഓർഡറുകൾ ലോഡ് ചെയ്യുന്നു...'}
              </p>
            </div>
          )}
          
          {user && !loading && orders.length === 0 && (
            <div className="order-history-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p className="order-history-status">
                {language === 'en' ? 'No orders found' : 'ഓർഡറുകൾ കണ്ടെത്തിയില്ല'}
              </p>
              <p className="order-history-meta">
                {language === 'en' ? 'Start shopping to see your orders here!' : 'നിങ്ങൾും ഓർഡറുകൾ ഇവിടെ കാണാൻ ശോപ്പിംഗ് ആരംഭിക്കുക!'}
              </p>
              <Link to="/products" className="order-history-reorder-button" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
                {language === 'en' ? 'Start Shopping' : 'ശോപ്പിംഗ് ആരംഭിക്കുക'}
              </Link>
            </div>
          )}
          
          {user && !loading && orders.map((order) => (
            <div key={order.id} className="order-history-card">
              <div className="order-history-card-content">
                <div className="order-history-details">
                  <p className="order-history-status">{order.status}</p>
                  <p className="order-history-order-number">{language === 'en' ? 'Order' : 'ഓർഡർ'} #{order.id}</p>
                  <p className="order-history-meta">
                    {order.items} {language === 'en' ? 'items' : 'സാധനങ്ങൾ'} • {order.date} • ₹{order.amount}
                  </p>
                  {order.paymentId && (
                    <p className="order-history-meta" style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      Payment ID: {order.paymentId}
                    </p>
                  )}
                  <button className="order-history-reorder-button">
                    {language === 'en' ? 'Reorder' : 'വീണ്ടും ഓർഡർ ചെയ്യുക'}
                    <span className="material-symbols-outlined">refresh</span>
                  </button>
                </div>
                <div className="order-history-image-container">
                  <img 
                    alt="Order Image" 
                    className="order-history-image" 
                    src={order.image}
                    onError={(e) => {
                      e.target.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgJYPfYx4Qswfa1xEunByEnbMtxCizy6P42YwzwbX9atn2LIkn_a-3y_om_C2OglA3KRb3SfHgQJvKAts3wgU9ePGTqJ_uC-scHxIGwEQfvNJwizh61PppsKJSlVKvI_ECvl_44J8ldHLvvJOQ7irLskzcDqs6Kk0B2RCK1i621fCQJO2niUPoIDyUb2zBucHYc5xqPSFMSEyDXjBDch4Pxvb1C_9Cdf6Uclqy3Zr_r4x9VdIKNk2qDjbnY1LKT5A1DvviHbKNKl8';
                    }}
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
            <span className="order-history-nav-text">{language === 'en' ? 'Home' : 'ഹോം'}</span>
          </Link>
          <Link className="order-history-nav-item order-history-nav-active" to="/order-history">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="order-history-nav-text">{language === 'en' ? 'Orders' : 'ഓർഡറുകൾ'}</span>
          </Link>
          <Link className="order-history-nav-item" to="/user-profile">
            <span className="material-symbols-outlined">person</span>
            <span className="order-history-nav-text">{language === 'en' ? 'Profile' : 'പ്രൊഫൈൽ'}</span>
          </Link>
          <Link className="order-history-nav-item" to="/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="order-history-nav-text">{language === 'en' ? 'Notifications' : 'അറിയിപ്പുകൾ'}</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default OrderHistory;