import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const UserProfile = () => {
  const settingsItems = [
    {
      icon: (
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
        </svg>
      ),
      title: 'Saved Bus Stops',
      link: '/saved-stops'
    },
    {
      icon: (
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M200,168a32.06,32.06,0,0,0-31,24H72a32,32,0,0,1,0-64h96a40,40,0,0,0,0-80H72a8,8,0,0,0,0,16h96a24,24,0,0,1,0,48H72a48,48,0,0,0,0,96h97a32,32,0,1,0,31-40Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,200,216Z"></path>
        </svg>
      ),
      title: 'Saved Routes',
      link: '/saved-routes'
    },
    {
      icon: (
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM101.63,168h52.74C149,186.34,140,202.87,128,215.89,116,202.87,107,186.34,101.63,168ZM98,152a145.72,145.72,0,0,1,0-48h60a145.72,145.72,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.79a161.79,161.79,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154.37,88H101.63C107,69.66,116,53.13,128,40.11,140,53.13,149,69.66,154.37,88Zm19.84,16h38.46a88.15,88.15,0,0,1,0,48H174.21a161.79,161.79,0,0,0,0-48Zm32.16-16H170.94a142.39,142.39,0,0,0-20.26-45A88.37,88.37,0,0,1,206.37,88ZM105.32,43A142.39,142.39,0,0,0,85.06,88H49.63A88.37,88.37,0,0,1,105.32,43ZM49.63,168H85.06a142.39,142.39,0,0,0,20.26,45A88.37,88.37,0,0,1,49.63,168Zm101.05,45a142.39,142.39,0,0,0,20.26-45h35.43A88.37,88.37,0,0,1,150.68,213Z"></path>
        </svg>
      ),
      title: 'Language',
      extra: 'English',
      link: '/language'
    },
    {
      icon: (
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,16H80A16,16,0,0,0,64,32V224a16,16,0,0,0,16,16h96a16,16,0,0,0,16-16V32A16,16,0,0,0,176,16ZM160,224H96V208h64Zm0-32H96V64h64ZM160,48H96V32h64Z"></path>
        </svg>
      ),
      title: 'Manage Settings',
      link: '/settings'
    },
    {
      icon: (
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
        </svg>
      ),
      title: 'Help & Support',
      link: '/support'
    }
  ];

  const paymentItems = [
    {
      icon: (
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M208,80a8,8,0,0,1-8,8H167.85c.09,1.32.15,2.65.15,4a60.07,60.07,0,0,1-60,60H92.69l72.69,66.08a8,8,0,1,1-10.76,11.84l-88-80A8,8,0,0,1,72,136h36a44.05,44.05,0,0,0,44-44c0-1.35-.07-2.68-.19-4H72a8,8,0,0,1,0-16h75.17A44,44,0,0,0,108,48H72a8,8,0,0,1,0-16H200a8,8,0,0,1,0,16H148.74a60.13,60.13,0,0,1,15.82,24H200A8,8,0,0,1,208,80Z"></path>
        </svg>
      ),
      title: 'UPI',
      link: '/upi'
    },
    {
      icon: (
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64Zm0,128H32V104H224v88Zm-16-24a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h32A8,8,0,0,1,208,168Zm-64,0a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,168Z"></path>
        </svg>
      ),
      title: 'Cards',
      link: '/cards'
    }
  ];

  const preferencesItems = [
    {
      icon: (
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"></path>
        </svg>
      ),
      title: 'Addresses',
      link: '/addresses'
    },
    {
      icon: (
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M232,96a7.89,7.89,0,0,0-.3-2.2L217.35,43.6A16.07,16.07,0,0,0,202,32H54A16.07,16.07,0,0,0,38.65,43.6L24.31,93.8A7.89,7.89,0,0,0,24,96v16a40,40,0,0,0,16,32v64a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V144a40,40,0,0,0,16-32ZM54,48H202l11.42,40H42.61Zm50,56h48v8a24,24,0,0,1-48,0Zm-16,0v8a24,24,0,0,1-48,0v-8ZM200,208H56V151.2a40.57,40.57,0,0,0,8,.8,40,40,0,0,0,32-16,40,40,0,0,0,64,0,40,40,0,0,0,32,16,40.57,40.57,0,0,0,8-.8Zm-8-72a24,24,0,0,1-24-24v-8h48v8A24,24,0,0,1,192,136Z"></path>
        </svg>
      ),
      title: 'Kiosk Preferences',
      link: '/kiosk-preferences'
    }
  ];

  return (
    <div className="main-wrapper bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200">
      <header className="header sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <Link to="/yathrika-home" className="text-gray-900 dark:text-white">
          <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
            <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
          </svg>
        </Link>
        <h1 className="header-title text-gray-900 dark:text-white">
          Account
        </h1>
      </header>

      <main className="flex-grow p-4 space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div 
            className="profile-avatar w-32 h-32 rounded-full bg-cover bg-center border-2 border-primary" 
            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB14tV6G9kmoE4uxq3hJp9nPxLv0lHQRILmiTGmjFd_EEctGgburaCaAJDEGnDIBMXDqTa9aMRZTu_0t73ATLkHCt2BNufHmogxCz-szGmm22WUG4Q9uZhV9y928aVzY7N3eVxN61RuG5yNR2zOHZcigJqjR2X51cCwIn4n2kJbW_e57AAA_oo_WGDCm73UmKFkLcMBSEj4GIlH536HOMxXy_xGRuxw1XQGsjGBHOYe9rOrHpcq2Ao6HL4Osw1X3BcE_QVFJaCgyWo")'}}
          ></div>
          <div className="profile-info text-center">
            <p className="profile-name text-2xl font-bold text-gray-900 dark:text-white">Raheem S</p>
            <p className="profile-phone text-base font-normal text-primary">+91 9876543210</p>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h2 className="section-title-profile">Settings</h2>
            <div className="settings-card">
              {settingsItems.map((item, index) => (
                <React.Fragment key={index}>
                  <Link to={item.link} className="settings-item">
                    <div className="settings-icon">
                      {item.icon}
                    </div>
                    <p className="settings-text">{item.title}</p>
                    {item.extra && <p className="settings-extra">{item.extra}</p>}
                  </Link>
                  {index < settingsItems.length - 1 && <div className="divider-line"></div>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <h2 className="section-title-profile">Payment</h2>
            <div className="settings-card">
              {paymentItems.map((item, index) => (
                <React.Fragment key={index}>
                  <Link to={item.link} className="settings-item">
                    <div className="settings-icon">
                      {item.icon}
                    </div>
                    <p className="settings-text">{item.title}</p>
                  </Link>
                  {index < paymentItems.length - 1 && <div className="divider-line"></div>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <h2 className="section-title-profile">Preferences</h2>
            <div className="settings-card">
              {preferencesItems.map((item, index) => (
                <React.Fragment key={index}>
                  <Link to={item.link} className="settings-item">
                    <div className="settings-icon">
                      {item.icon}
                    </div>
                    <p className="settings-text">{item.title}</p>
                  </Link>
                  {index < preferencesItems.length - 1 && <div className="divider-line"></div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="footer-nav-container">
        <nav className="footer-nav-inner">
          <Link className="footer-nav-item" to="/yathrika-home">
            <svg className="footer-nav-icon" fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.10Z"></path>
            </svg>
            <span className="footer-nav-text">Home</span>
          </Link>
          <Link className="footer-nav-item" to="/order-history">
            <svg className="footer-nav-icon" fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M72,104a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm8,40h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM232,56V208a8,8,0,0,1-11.58,7.15L192,200.94l-28.42,14.21a8,8,0,0,1-7.16,0L128,200.94,99.58,215.15a8,8,0,0,1-7.16,0L64,200.94,35.58,215.15A8,8,0,0,1,24,208V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Zm-16,0H40V195.06l20.42-10.22a8,8,0,0,1,7.16,0L96,199.06l28.42-14.22a8,8,0,0,1,7.16,0L160,199.06l28.42-14.22a8,8,0,0,1,7.16,0L216,195.06Z"></path>
            </svg>
            <span className="footer-nav-text">Orders</span>
          </Link>
          <Link className="footer-profile-active" to="/user-profile">
            <div className="footer-profile-icon">
              <svg fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
                <path d="M230.93,220a8,8,0,0,1-6.93,4H32a8,8,0,0,1-6.92-12c15.23-26.33,38.7-45.21,66.09-54.16a72,72,0,1,1,73.66,0c27.39,8.95,50.86,27.83,66.09,54.16A8,8,0,0,1,230.93,220Z"></path>
              </svg>
            </div>
            <span className="footer-profile-label">Profile</span>
          </Link>
          <Link className="footer-nav-item" to="/notifications">
            <svg className="footer-nav-icon" fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
            <span className="footer-nav-text">Notifications</span>
          </Link>
        </nav>
        <div className="footer-nav-spacer"></div>
      </footer>
    </div>
  );
};

export default UserProfile;