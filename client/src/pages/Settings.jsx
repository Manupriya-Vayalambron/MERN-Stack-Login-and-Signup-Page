import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../NotificationContext';
import { useLanguage } from '../LanguageContext';
import '../index.css';

const TEXT = {
  en: {
    title: 'Settings',
    preferences: 'Preferences',
    support: 'Support',
    language: 'Language',
    languageHint: 'Tap to switch language',
    darkMode: 'Dark Mode',
    darkModeHintOn: 'Dark theme is active',
    darkModeHintOff: 'Light theme is active',
    notifications: 'Notifications',
    notificationsEnabled: 'Enabled for this browser',
    notificationsDenied: 'Blocked by browser settings',
    notificationsUnsupported: 'Not supported on this device',
    notificationsPrompt: 'Tap to enable push alerts',
    enable: 'Enable',
    enabled: 'Enabled',
    helpSupport: 'Help & Support',
    helpSupportHint: 'FAQs, contact and report issues',
    home: 'Home',
    orders: 'Orders',
    profile: 'Profile',
    english: 'English',
    malayalam: 'Malayalam',
  },
  ml: {
    title: 'ക്രമീകരണങ്ങൾ',
    preferences: 'മുൻഗണനകൾ',
    support: 'പിന്തുണ',
    language: 'ഭാഷ',
    languageHint: 'ഭാഷ മാറ്റാൻ അമർത്തുക',
    darkMode: 'ഡാർക് മോഡ്',
    darkModeHintOn: 'ഡാർക് തീം സജീവമാണ്',
    darkModeHintOff: 'ലൈറ്റ് തീം സജീവമാണ്',
    notifications: 'അറിയിപ്പുകൾ',
    notificationsEnabled: 'ഈ ബ്രൗസറിൽ സജീവമാണ്',
    notificationsDenied: 'ബ്രൗസർ ക്രമീകരണത്തിൽ തടഞ്ഞിരിക്കുന്നു',
    notificationsUnsupported: 'ഈ ഉപകരണത്തിൽ പിന്തുണയില്ല',
    notificationsPrompt: 'പുഷ് അറിയിപ്പുകൾക്കായി അമർത്തുക',
    enable: 'പ്രവർത്തനക്ഷമമാക്കുക',
    enabled: 'സജീവമാണ്',
    helpSupport: 'സഹായവും പിന്തുണയും',
    helpSupportHint: 'FAQ, ബന്ധപ്പെടൽ, പ്രശ്ന റിപ്പോർട്ട്',
    home: 'ഹോം',
    orders: 'ഓർഡറുകൾ',
    profile: 'പ്രൊഫൈൽ',
    english: 'ഇംഗ്ലീഷ്',
    malayalam: 'മലയാളം',
  },
};

const DARK_MODE_KEY = 'yathrika_dark_mode';

const getInitialDarkMode = () => {
  try {
    const saved = localStorage.getItem(DARK_MODE_KEY);
    if (saved === 'true') return true;
    if (saved === 'false') return false;
  } catch (_) {}

  return document.documentElement.classList.contains('dark');
};

const Settings = () => {
  const navigate = useNavigate();
  const { browserPermission, requestBrowserPermission, subscribeForPush } = useNotification();
  const { language, toggleLanguage } = useLanguage();
  const t = TEXT[language] || TEXT.en;

  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
    } catch (_) {}
  }, [isDarkMode]);

  const handleEnableNotifications = async () => {
    const permission = await requestBrowserPermission();
    if (permission === 'granted') {
      try {
        const user = JSON.parse(localStorage.getItem('yathrika_user') || 'null');
        if (user?.phoneNumber) {
          await subscribeForPush(user.phoneNumber);
        }
      } catch (_) {}
    }
  };

  const notificationSubtitle =
    browserPermission === 'granted'
      ? t.notificationsEnabled
      : browserPermission === 'denied'
      ? t.notificationsDenied
      : browserPermission === 'unsupported'
      ? t.notificationsUnsupported
      : t.notificationsPrompt;

  return (
    <div style={S.page}>
      <header style={S.header}>
        <Link to="/user-profile" style={S.backButton} aria-label="Back to profile">
          <svg fill="currentColor" height="22" viewBox="0 0 256 256" width="22" xmlns="http://www.w3.org/2000/svg">
            <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
          </svg>
        </Link>
        <h1 style={S.title}>{t.title}</h1>
        <div style={{ width: 42 }} />
      </header>

      <main style={S.main}>
        <section style={S.section}>
          <h2 style={S.sectionTitle}>{t.preferences}</h2>
          <div style={S.group}>
            <button type="button" onClick={toggleLanguage} style={S.itemButton}>
              <div style={S.itemIcon}>
                <span className="material-symbols-outlined" style={S.iconGlyph}>language</span>
              </div>
              <div style={S.itemTextWrap}>
                <p style={S.itemTitle}>{t.language}</p>
                <p style={S.itemSubtitle}>
                  {language === 'en' ? t.english : t.malayalam} • {t.languageHint}
                </p>
              </div>
              <span className="material-symbols-outlined" style={S.trailingIcon}>autorenew</span>
            </button>

            <div style={S.itemRow}>
              <div style={S.itemIcon}>
                <span className="material-symbols-outlined" style={S.iconGlyph}>notifications</span>
              </div>
              <div style={S.itemTextWrap}>
                <p style={S.itemTitle}>{t.notifications}</p>
                <p style={S.itemSubtitle}>{notificationSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={handleEnableNotifications}
                disabled={browserPermission === 'granted' || browserPermission === 'unsupported'}
                style={{
                  ...S.pillButton,
                  ...(browserPermission === 'granted' ? S.pillButtonActive : {}),
                  opacity: browserPermission === 'unsupported' ? 0.6 : 1,
                  cursor: browserPermission === 'granted' || browserPermission === 'unsupported' ? 'default' : 'pointer',
                }}
              >
                {browserPermission === 'granted' ? t.enabled : t.enable}
              </button>
            </div>

            <div style={S.itemRow}>
              <div style={S.itemIcon}>
                <span className="material-symbols-outlined" style={S.iconGlyph}>dark_mode</span>
              </div>
              <div style={S.itemTextWrap}>
                <p style={S.itemTitle}>{t.darkMode}</p>
                <p style={S.itemSubtitle}>{isDarkMode ? t.darkModeHintOn : t.darkModeHintOff}</p>
              </div>
              <label style={S.toggleWrap}>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={(e) => setIsDarkMode(e.target.checked)}
                  style={S.toggleInput}
                />
                <span style={{ ...S.toggleTrack, ...(isDarkMode ? S.toggleTrackOn : {}) }}>
                  <span style={{ ...S.toggleThumb, ...(isDarkMode ? S.toggleThumbOn : {}) }} />
                </span>
              </label>
            </div>
          </div>
        </section>

        <section style={S.section}>
          <h2 style={S.sectionTitle}>{t.support}</h2>
          <div style={S.group}>
            <button type="button" onClick={() => navigate('/support')} style={S.itemButton}>
              <div style={S.itemIcon}>
                <span className="material-symbols-outlined" style={S.iconGlyph}>help</span>
              </div>
              <div style={S.itemTextWrap}>
                <p style={S.itemTitle}>{t.helpSupport}</p>
                <p style={S.itemSubtitle}>{t.helpSupportHint}</p>
              </div>
              <span className="material-symbols-outlined" style={S.trailingIcon}>chevron_right</span>
            </button>
          </div>
        </section>
      </main>

      <footer style={S.footer}>
        {[
          { to: '/yathrika-home', icon: 'home', label: t.home, active: false },
          { to: '/order-history', icon: 'receipt_long', label: t.orders, active: false },
          { to: '/user-profile', icon: 'person', label: t.profile, active: true },
        ].map((item) => (
          <Link key={item.to} to={item.to} style={S.navItem}>
            <span className="material-symbols-outlined" style={{ ...S.navIcon, color: item.active ? '#68f91a' : '#555' }}>
              {item.icon}
            </span>
            <span style={{ ...S.navLabel, color: item.active ? '#68f91a' : '#555' }}>{item.label}</span>
          </Link>
        ))}
      </footer>
    </div>
  );
};

const S = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#16230f',
    fontFamily: "'Space Grotesk', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 74,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(104,249,26,0.08)',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#68f91a',
    background: 'rgba(104,249,26,0.08)',
    border: '1px solid rgba(104,249,26,0.16)',
    textDecoration: 'none',
    flexShrink: 0,
  },
  title: {
    color: '#68f91a',
    fontSize: '1.2rem',
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  main: {
    padding: '14px 16px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(104,249,26,0.1)',
    borderRadius: 18,
    padding: '16px 14px 6px',
  },
  sectionTitle: {
    margin: '0 0 12px',
    color: '#68f91a',
    fontSize: '0.82rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 700,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '1px solid rgba(104,249,26,0.1)',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: '11px 12px',
  },
  itemButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '1px solid rgba(104,249,26,0.1)',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: '11px 12px',
    width: '100%',
    color: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    border: '1px solid rgba(104,249,26,0.25)',
    backgroundColor: 'rgba(104,249,26,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconGlyph: {
    color: '#68f91a',
    fontSize: 18,
  },
  itemTextWrap: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  itemTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '0.88rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  itemSubtitle: {
    margin: 0,
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.72rem',
    fontWeight: 500,
    lineHeight: 1.35,
  },
  trailingIcon: {
    color: '#68f91a',
    fontSize: 18,
    opacity: 0.85,
    flexShrink: 0,
  },
  pillButton: {
    border: '1px solid rgba(104,249,26,0.35)',
    background: 'rgba(255,255,255,0.03)',
    color: '#e5e7eb',
    borderRadius: 10,
    padding: '6px 10px',
    fontSize: '0.72rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  pillButtonActive: {
    background: 'rgba(104,249,26,0.18)',
    color: '#68f91a',
  },
  toggleWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  toggleInput: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.16)',
    display: 'inline-flex',
    alignItems: 'center',
    padding: 2,
    transition: 'all 0.2s ease',
  },
  toggleTrackOn: {
    backgroundColor: 'rgba(104,249,26,0.25)',
    border: '1px solid rgba(104,249,26,0.45)',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    transition: 'transform 0.2s ease',
  },
  toggleThumbOn: {
    transform: 'translateX(18px)',
    backgroundColor: '#68f91a',
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    backgroundColor: '#0d1808',
    borderTop: '1px solid rgba(104,249,26,0.08)',
    padding: '8px 0 10px',
    zIndex: 100,
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    textDecoration: 'none',
    padding: '4px 0',
  },
  navIcon: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: '0.63rem',
    fontWeight: 600,
  },
};

export default Settings;
