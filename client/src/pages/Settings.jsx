import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Settings = () => {
  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: 'person', title: 'Edit Profile', subtitle: 'Change your details' },
        { icon: 'lock', title: 'Privacy', subtitle: 'Control your privacy' },
        { icon: 'security', title: 'Security', subtitle: 'Password & 2FA' }
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'notifications', title: 'Notifications', subtitle: 'Push notifications' },
        { icon: 'language', title: 'Language', subtitle: 'English / മലയാളം' },
        { icon: 'dark_mode', title: 'Dark Mode', subtitle: 'Appearance settings' }
      ]
    },
    {
      title: 'App',
      items: [
        { icon: 'download', title: 'App Updates', subtitle: 'Auto-update settings' },
        { icon: 'storage', title: 'Data Usage', subtitle: 'Manage app data' },
        { icon: 'info', title: 'About', subtitle: 'Version & legal info' }
      ]
    }
  ];

  return (
    <div className="settings-page-container">
      <div className="settings-content-wrapper">
        <header className="settings-header">
          <div className="settings-header-inner">
            <Link to="/user-profile" className="settings-back-button">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
              </svg>
            </Link>
            <h1 className="settings-page-title">Settings</h1>
          </div>
        </header>

        <main className="settings-main-content">
          <section className="settings-preferences-section">
            <h2 className="settings-section-title">Preferences</h2>
            <div className="settings-group-container">
              <div className="settings-item">
                <div className="settings-item-icon">
                  <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM101.63,168h52.74C149,186.34,140,202.87,128,215.89,116,202.87,107,186.34,101.63,168ZM98,152a145.72,145.72,0,0,1,0-48h60a145.72,145.72,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.79a161.79,161.79,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154.37,88H101.63C107,69.66,116,53.13,128,40.11,140,53.13,149,69.66,154.37,88Zm19.84,16h38.46a88.15,88.15,0,0,1,0,48H174.21a161.79,161.79,0,0,0,0-48Zm32.16-16H170.94a142.39,142.39,0,0,0-20.26-45A88.37,88.37,0,0,1,206.37,88ZM105.32,43A142.39,142.39,0,0,0,85.06,88H49.63A88.37,88.37,0,0,1,105.32,43ZM49.63,168H85.06a142.39,142.39,0,0,0,20.26,45A88.37,88.37,0,0,1,49.63,168Zm101.05,45a142.39,142.39,0,0,0,20.26-45h35.43A88.37,88.37,0,0,1,150.68,213Z"></path>
                  </svg>
                </div>
                <div className="settings-item-content">
                  <p className="settings-item-title">Language</p>
                  <p className="settings-item-subtitle">English</p>
                </div>
                <svg className="settings-chevron-icon" fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                </svg>
              </div>

              <div className="settings-item">
                <div className="settings-item-icon">
                  <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
                    <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
                  </svg>
                </div>
                <p className="settings-item-title-solo">Notifications</p>
                <svg className="settings-chevron-icon" fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                </svg>
              </div>

              <div className="settings-item">
                <div className="settings-item-icon">
                  <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
                    <path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56A104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"></path>
                  </svg>
                </div>
                <p className="settings-item-title-solo">Dark Mode</p>
                <label className="settings-toggle-switch">
                  <div className="settings-toggle-track">
                    <div className="settings-toggle-thumb"></div>
                  </div>
                  <input className="settings-toggle-input" type="checkbox" defaultChecked />
                </label>
              </div>
            </div>
          </section>

          <section className="settings-support-section">
            <h2 className="settings-section-title">Support</h2>
            <div className="settings-group-container">
              <div className="settings-item">
                <div className="settings-item-icon">
                  <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
                    <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                  </svg>
                </div>
                <p className="settings-item-title-solo">Help & Support</p>
                <svg className="settings-chevron-icon" fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                </svg>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="settings-footer-nav">
        <div className="settings-nav-container">
          <Link className="settings-nav-item" to="/yathrika-home">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"></path>
            </svg>
            <span className="settings-nav-text">Home</span>
          </Link>
          <Link className="settings-nav-item" to="/order-history">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M247.42,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,247.42,117ZM184,88h34.58l9.6,24H184ZM24,72H168v64H24ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm81-24H103a32,32,0,0,0-62,0H24V152H168v12.31A32.11,32.11,0,0,0,153,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,184,208Zm48-24H215a32.06,32.06,0,0,0-31-24V128h48Z"></path>
            </svg>
            <span className="settings-nav-text">Orders</span>
          </Link>
          <Link className="settings-nav-item settings-nav-active" to="/user-profile">
            <div className="settings-nav-profile-container">
              <div className="settings-nav-profile-indicator"></div>
              <div className="settings-nav-profile-button">
                <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M230.93,220a8,8,0,0,1-6.93,4H32a8,8,0,0,1-6.92-12c15.23-26.33,38.7-45.21,66.09-54.16a72,72,0,1,1,73.66,0c27.39,8.95,50.86,27.83,66.09,54.16A8,8,0,0,1,230.93,220Z"></path>
                </svg>
              </div>
            </div>
            <span className="settings-nav-text settings-nav-text-active">Profile</span>
          </Link>
          <Link className="settings-nav-item" to="/notifications">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
            <span className="settings-nav-text">Notifications</span>
          </Link>
        </div>
        <div className="settings-nav-spacer"></div>
      </footer>
    </div>
  );
};

export default Settings;