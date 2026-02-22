import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import '../index.css';

const Admin = () => {
  const liveOrders = [
    {
      id: '12345',
      busStop: 'Central Station',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANBNNPjU6mAdXgx9-Fxxv5MBddePWJ-pSX4LrulHuuc-tqmQmq4Z0_ncoqaUE3n-BYLW4grTNw1934fdHpzESm_Exbsc3BEoHgO5dbP2HTZ1OClzQLoeLnELDJ4C-G-LYeW8Jk9Rp_zBH3QjMtOn49u23b80I0GH2Ac2TZnqeBUn3UqaF9ET1S60lITMd5ojw8tgkVtlWgidfdhROKun6KL3fbUZtavnlpCL1WoxEL_-Zck5DEMqUZQ-Yi35NMDupWWiFySbtQTOk'
    },
    {
      id: '67890',
      busStop: 'University',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH8ODLdc3m1ywvPxzCcfZFlON0demJOYF6T9kcUiipaiVJmOQJaKYe0lSEiwMzLwAcLr3wAozC3lG7nQ990P7iHyAayE8vGyATUamiT9zrqpY1I9ULPUckyhhSdRTqDXAQLIEwlqTpB6LzImdARYqVwdjwMP152o6rSzu6h_JzMQuEkiT-BRPvkvRxV99R4HgG1YH2QfhtG0aCtOIx4pX9XdIqy3h4PPIxSUX0WriDQNjIhSyralKjdJ_H2tdwCZ4X04nl5CIYVaM'
    }
  ];

  const deliveryPartners = [
    {
      name: 'Partner A',
      status: 'Available',
      isAvailable: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4GPvwV4RDb72PUb8742zR_yJf0DAvkvffjsHdrvlDIW58M27hPPPgi5swaYroOzFWuZFBUfqraBE_u720qGeBrBO_vW3o5gBIPaN62vjnApGxc7GwJ2_ThpTwWW22qaANpqfGlDYq8Yxvt9F6prSsUef8qXWbGCldsvYn_l34fY2tIgCYDWeO8rkxhz9a9eGv43szA9wY9YC-PHG1SwuHzUympCfLjWSqjgdZWLRqNrJqCdlVm8kPfkRFOvji2SktB5-46F8NDw'
    },
    {
      name: 'Partner B',
      status: 'Busy',
      isAvailable: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzMgMvlL2B7uu6RwppB7YEfFgK4J-du3DGbJe0WLCk7gglWlI-uIfhwHD5cLHWFlYko_tVCD_3ikmvWu9gg_nXQJdHpF7Bt5pRtmB98OcX1UH_fKCZYmHeF9yeYG9pA563JaDLFwnzwuRT0Bq2IKM6Qt4EWjp_n8rYGiAKWwhEp2ftCOFsjceYHhP2GB7UKFx-cgQblqQw4QFRMdQzvvrm0VIBGSWrJucfS4vg4fcbr8_WjwZ_ynY01zfYvlqF1Iiv3_-MnwIii_U'
    }
  ];

  return (
    <div className="admin-page-container">
      <div className="admin-content-wrapper">
        <header className="admin-header">
          <div className="admin-header-inner">
            <div className="admin-header-spacer"></div>
            <h1 className="admin-page-title">Yathrika Admin</h1>
            <div className="admin-settings-container">
              <button className="admin-settings-button">
                <svg className="admin-settings-icon" fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M216.7,132.7,199.11,154a8,8,0,0,0-2,5.85,75.46,75.46,0,0,1,0,12.3,8,8,0,0,0,2,5.85l17.59,21.3a8,8,0,0,1-1.39,11.83l-19.45,16a8,8,0,0,0-6.14,1,75.43,75.43,0,0,1-10.66,10.66,8,8,0,0,0-1,6.14l-2.82,21.75a8,8,0,0,1-10.42,7.3l-21-5.61a8,8,0,0,0-6.4,0,76.5,76.5,0,0,1-12.3,0,8,8,0,0,0-6.4,0l-21,5.61a8,8,0,0,1-10.42-7.3l-2.82-21.75a8,8,0,0,0-1-6.14,75.43,75.43,0,0,1-10.66-10.66,8,8,0,0,0-6.14-1l-19.45-16a8,8,0,0,1-1.39-11.83l17.59-21.3a8,8,0,0,0,2-5.85,75.46,75.46,0,0,1,0-12.3,8,8,0,0,0-2-5.85L39.3,123.3a8,8,0,0,1,1.39-11.83l19.45-16a8,8,0,0,0,6.14-1,75.43,75.43,0,0,1,10.66-10.66,8,8,0,0,0,1-6.14l2.82-21.75a8,8,0,0,1,10.42-7.3l21,5.61a8,8,0,0,0,6.4,0,76.5,76.5,0,0,1,12.3,0,8,8,0,0,0,6.4,0l21-5.61a8,8,0,0,1,10.42,7.3l2.82,21.75a8,8,0,0,0,1,6.14,75.43,75.43,0,0,1,10.66,10.66,8,8,0,0,0,6.14,1l19.45,16A8,8,0,0,1,216.7,132.7ZM128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="admin-main-content">
          <section className="admin-live-tracking-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Live Location Tracking</h2>
              <Link to="/live-tracking-demo" className="admin-partner-dashboard-button">
                <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M240,112H224V96a16,16,0,0,0-16-16H184V64a16,16,0,0,0-16-16H88A16,16,0,0,0,72,64V80H48A16,16,0,0,0,32,96v16H16a8,8,0,0,0,0,16H32v16H16a8,8,0,0,0,0,16H32v16H16a8,8,0,0,0,0,16H32v16a16,16,0,0,0,16,16H72v16a16,16,0,0,0,16,16h80a16,16,0,0,0,16-16V208h24a16,16,0,0,0,16-16V176h16a8,8,0,0,0,0-16H224V144h16a8,8,0,0,0,0-16H224V112ZM184,192H88V80h96V192Z"></path>
                </svg>
                View Demo
              </Link>
            </div>
            <div className="admin-tracking-info">
              <p>Real-time location tracking system using OpenStreetMap (no API fees required)</p>
              <div className="admin-tracking-features">
                <div className="admin-feature-item">
                  <span>📍</span>
                  <span>Live GPS tracking</span>
                </div>
                <div className="admin-feature-item">
                  <span>🗺️</span>
                  <span>Free mapping</span>
                </div>
                <div className="admin-feature-item">
                  <span>⚡</span>
                  <span>Real-time updates</span>
                </div>
                <div className="admin-feature-item">
                  <span>📊</span>
                  <span>Distance & ETA</span>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-live-orders-section">
            <h2 className="admin-section-title">Live Orders</h2>
            <div className="admin-orders-list">
              {liveOrders.map((order) => (
                <div key={order.id} className="admin-order-card">
                  <div className="admin-order-details">
                    <div className="admin-order-info">
                      <p className="admin-order-number">Order #{order.id}</p>
                      <p className="admin-bus-stop">Bus Stop: {order.busStop}</p>
                    </div>
                    <Link to="/tracking" className="admin-track-button">
                      Track Live
                    </Link>
                  </div>
                  <div 
                    className="admin-order-image" 
                    style={{backgroundImage: `url("${order.image}")`}}
                  ></div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-partners-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Delivery Partners</h2>
              <div className="admin-partner-actions">
                <Link to="/delivery-partner" className="admin-partner-dashboard-button">
                  <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm32-120v8a8,8,0,0,1-8,8H136v64a8,8,0,0,1-16,0V112a8,8,0,0,1,8-8h24A8,8,0,0,1,160,112ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
                  </svg>
                  Legacy Dashboard
                </Link>
                <Link to="/delivery-partner-auth" className="admin-partner-auth-button">
                  <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0c-27.39,8.94-50.86,27.82-66.09,54.16a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                  </svg>
                  Partner Login
                </Link>
              </div>
            </div>
            <div className="admin-partners-info">
              <p>Manage delivery partners with separate authentication system and real-time order management</p>
              <div className="admin-partner-features">
                <div className="admin-feature-item">
                  <span>🔐</span>
                  <span>Secure partner authentication</span>
                </div>
                <div className="admin-feature-item">
                  <span>📱</span>
                  <span>Real-time order acceptance</span>
                </div>
                <div className="admin-feature-item">
                  <span>🚀</span>
                  <span>Status update system</span>
                </div>
                <div className="admin-feature-item">
                  <span>📞</span>
                  <span>Direct customer communication</span>
                </div>
              </div>
            </div>
            <div className="admin-partners-list">
              {deliveryPartners.map((partner, index) => (
                <div key={index} className="admin-partner-card">
                  <div 
                    className="admin-partner-avatar" 
                    style={{backgroundImage: `url("${partner.image}")`}}
                  ></div>
                  <div className="admin-partner-info">
                    <p className="admin-partner-name">{partner.name}</p>
                    <p className={`admin-partner-status ${partner.isAvailable ? 'admin-status-available' : 'admin-status-busy'}`}>
                      {partner.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-revenue-section">
            <h2 className="admin-section-title">Revenue</h2>
            <div className="admin-revenue-card">
              <p className="admin-revenue-label">Total Today</p>
              <p className="admin-revenue-amount">$5,432</p>
            </div>
          </section>
        </main>
      </div>

      <footer className="admin-footer-nav">
        <div className="admin-nav-container">
          <Link className="admin-nav-item admin-nav-active" to="/admin">
            <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0l.11.11,80,75.48A16,16,0,0,1,224,115.55Z"></path>
            </svg>
          </Link>
          <Link className="admin-nav-item" to="/analytics">
            <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
              <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0v94.37L90.73,98a8,8,0,0,1,10.07-.38l58.81,44.11L218.73,90a8,8,0,1,1,10.54,12l-64,56a8,8,0,0,1-10.07.38L96.39,114.29,40,163.63V200H224A8,8,0,0,1,232,208Z"></path>
            </svg>
          </Link>
          <Link className="admin-nav-item" to="/users">
            <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
              <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
            </svg>
          </Link>
          <Link className="admin-nav-item" to="/routes">
            <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
              <path d="M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-5.52-.6l-64,16A8,8,0,0,0,24,56V200a8,8,0,0,0,9.94,7.76l61.13-15.28,61.35,30.68A8.15,8.15,0,0,0,160,224a8,8,0,0,0,1.94-.24l64-16A8,8,0,0,0,232,200V56A8,8,0,0,0,228.92,49.69ZM104,52.94l48,24V203.06l-48-24ZM40,62.25l48-12v127.5l-48,12Zm176,131.5-48,12V78.25l48-12Z"></path>
            </svg>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Admin;