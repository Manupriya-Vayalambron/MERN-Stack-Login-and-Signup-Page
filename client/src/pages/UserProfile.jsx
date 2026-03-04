import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';
import '../index.css';

// ─── Inline styles injected once ─────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap');

  .up-root * { box-sizing: border-box; }
  .up-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background-color: #0c1508;
    color: #e8f5d8;
    display: flex;
    flex-direction: column;
  }

  /* Header */
  .up-header {
    position: sticky; top: 0; z-index: 20;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    background: rgba(12,21,8,0.88);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(104,249,26,0.08);
  }
  .up-header-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: #e8f5d8; margin: 0;
  }
  .up-back-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(104,249,26,0.06); border: 1px solid rgba(104,249,26,0.12);
    color: #68f91a; text-decoration: none; transition: background 0.2s;
  }
  .up-back-btn:hover { background: rgba(104,249,26,0.12); }

  /* Hero */
  .up-hero {
    position: relative; display: flex; flex-direction: column; align-items: center;
    padding: 40px 24px 36px; overflow: hidden;
  }
  .up-hero::before {
    content: ''; position: absolute; top: -60px; left: 50%;
    transform: translateX(-50%); width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(104,249,26,0.09) 0%, transparent 68%);
    pointer-events: none;
  }
  .up-hero::after {
    content: ''; position: absolute; bottom: 0; left: 20px; right: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(104,249,26,0.13), transparent);
  }

  /* Avatar */
  .up-avatar-wrap { position: relative; margin-bottom: 22px; }
  .up-avatar {
    width: 88px; height: 88px; border-radius: 26px;
    background: linear-gradient(145deg, rgba(104,249,26,0.18), rgba(104,249,26,0.05));
    border: 1.5px solid rgba(104,249,26,0.28);
    display: flex; align-items: center; justify-content: center; overflow: hidden;
  }
  .up-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
  .up-avatar-initials {
    font-family: 'Syne', sans-serif; font-size: 1.9rem; font-weight: 800;
    color: #68f91a; letter-spacing: -0.02em;
  }
  .up-avatar-badge {
    position: absolute; bottom: -5px; right: -5px;
    width: 22px; height: 22px; border-radius: 7px;
    background: #68f91a; border: 2.5px solid #0c1508;
    display: flex; align-items: center; justify-content: center;
  }

  /* Name */
  .up-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .up-name-text {
    font-family: 'Syne', sans-serif; font-size: 1.45rem; font-weight: 800;
    color: #f0fce8; margin: 0; letter-spacing: -0.025em; line-height: 1.1;
  }
  .up-edit-btn {
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(104,249,26,0.07); border: 1px solid rgba(104,249,26,0.14);
    color: #68f91a; cursor: pointer; transition: background 0.2s;
  }
  .up-edit-btn:hover { background: rgba(104,249,26,0.14); }
  .up-phone-chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(104,249,26,0.06); border: 1px solid rgba(104,249,26,0.13);
    border-radius: 100px; padding: 4px 13px;
    font-size: 0.8rem; font-weight: 600; color: #88cc50; letter-spacing: 0.03em;
  }

  /* Edit form */
  .up-edit-form {
    display: flex; flex-direction: column; align-items: center;
    gap: 10px; width: 100%; max-width: 290px;
  }
  .up-edit-input {
    width: 100%; background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(104,249,26,0.4); border-radius: 12px;
    padding: 11px 16px; color: #f0fce8;
    font-size: 1.05rem; font-weight: 700; font-family: 'Syne', sans-serif;
    text-align: center; outline: none; letter-spacing: -0.01em;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .up-edit-input:focus { border-color: #68f91a; box-shadow: 0 0 0 3px rgba(104,249,26,0.1); }
  .up-edit-actions { display: flex; gap: 8px; width: 100%; }
  .up-save-btn {
    flex: 1; background: #68f91a; color: #0c1508; border: none;
    border-radius: 12px; padding: 10px 0; font-weight: 800;
    font-size: 0.88rem; font-family: 'DM Sans', sans-serif; cursor: pointer;
    letter-spacing: 0.02em; transition: opacity 0.2s;
  }
  .up-save-btn:hover { opacity: 0.88; }
  .up-cancel-btn {
    flex: 1; background: rgba(255,255,255,0.05); color: #7a9a6a;
    border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 0;
    font-weight: 600; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background 0.2s;
  }
  .up-cancel-btn:hover { background: rgba(255,255,255,0.08); }

  /* Menu */
  .up-section-label {
    font-size: 0.63rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: #3d5530; padding: 0 20px; margin-bottom: 8px;
  }
  .up-menu-card {
    margin: 0 16px 8px;
    background: #111d0a; border: 1px solid rgba(255,255,255,0.06);
    border-radius: 18px; overflow: hidden;
  }
  .up-menu-item {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 18px; text-decoration: none; color: #c8e0b0;
    cursor: pointer; transition: background 0.15s;
    width: 100%; background: none; border: none; text-align: left;
    font-family: 'DM Sans', sans-serif;
  }
  .up-menu-item:hover { background: rgba(104,249,26,0.04); }
  .up-menu-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .up-menu-label { flex: 1; font-size: 0.92rem; font-weight: 600; margin: 0; letter-spacing: 0.01em; }
  .up-menu-chevron { color: #2d4020; flex-shrink: 0; }
  .up-menu-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 0 18px; }
  .up-signout { color: #e05555 !important; }
  .up-signout-icon { background: rgba(224,85,85,0.09) !important; border: 1px solid rgba(224,85,85,0.14) !important; color: #e05555 !important; }

  /* Footer */
  .up-footer {
    margin-top: auto;
    background: rgba(12,21,8,0.95); backdrop-filter: blur(16px);
    border-top: 1px solid rgba(104,249,26,0.08);
  }
  .up-footer-inner {
    display: flex; align-items: stretch; justify-content: space-around; padding: 10px 0 4px;
  }
  .up-nav-item {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 6px 22px; text-decoration: none; color: #3d5530;
    transition: color 0.15s; border: none; background: none; cursor: pointer;
  }
  .up-nav-item:hover { color: #7a9a6a; }
  .up-nav-active {
    color: #68f91a !important; position: relative;
  }
  .up-nav-active::before {
    content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 20px; height: 2px; background: #68f91a; border-radius: 0 0 2px 2px;
  }
  .up-nav-label { font-size: 0.61rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
  .up-footer-spacer { height: env(safe-area-inset-bottom, 8px); }

  @keyframes upSlide { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  .up-hero        { animation: upSlide 0.38s ease-out both; }
  .up-section-label { animation: upSlide 0.38s ease-out 0.07s both; }
  .up-menu-card   { animation: upSlide 0.38s ease-out 0.12s both; }
`;

const Chevron = () => (
  <svg fill="currentColor" height="17" viewBox="0 0 256 256" width="17" xmlns="http://www.w3.org/2000/svg">
    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/>
  </svg>
);

const UserProfile = () => {
  const { language } = useLanguage();
  const { user, getDisplayName, updateUser, signOut } = useUser();

  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState('');
  const [nameMsg,     setNameMsg]     = useState('');

  const t = (en, ml) => language === 'en' ? en : ml;

  const startEditName = () => { setNameInput(user?.name || ''); setNameMsg(''); setEditingName(true); };
  const saveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameMsg(t('Name cannot be empty.', 'പേര് ശൂന്യമാകരുത്.')); return; }
    updateUser({ name: trimmed });
    setNameMsg(t('Name updated!', 'പേര് അപ്ഡേറ്റ് ചെയ്തു!'));
    setTimeout(() => { setEditingName(false); setNameMsg(''); }, 1200);
  };

  const initials = user?.name
    ? user.name.trim().split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : user?.phoneNumber?.slice(-2) ?? 'U';

  const menuItems = [
    {
      iconBg: 'rgba(104,249,26,0.08)', iconBorder: 'rgba(104,249,26,0.15)', iconColor: '#68f91a',
      icon: <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,16H80A16,16,0,0,0,64,32V224a16,16,0,0,0,16,16h96a16,16,0,0,0,16-16V32A16,16,0,0,0,176,16ZM160,224H96V208h64Zm0-32H96V64h64ZM160,48H96V32h64Z"/></svg>,
      title: t('Settings', 'ക്രമീകരണങ്ങൾ'), link: '/settings',
    },
    {
      iconBg: 'rgba(91,184,255,0.08)', iconBorder: 'rgba(91,184,255,0.15)', iconColor: '#5bb8ff',
      icon: <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20"><path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>,
      title: t('Help & Support', 'സഹായവും പിന്തുണയും'), link: '/support',
    },
  ];

  return (
    <div className="up-root">
      <style>{STYLES}</style>

      <header className="up-header">
        <Link to="/yathrika-home" className="up-back-btn" aria-label="Back">
          <svg fill="currentColor" height="18" viewBox="0 0 256 256" width="18"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>
        </Link>
        <h1 className="up-header-title">{t('Account', 'അക്കൗണ്ട്')}</h1>
        <div style={{ width: 36 }} />
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 16 }}>

        {/* ── Hero ── */}
        <div className="up-hero">
          <div className="up-avatar-wrap">
            <div className="up-avatar">
              {user?.photoURL
                ? <img src={user.photoURL} alt="avatar" />
                : <span className="up-avatar-initials">{initials}</span>
              }
            </div>
            <div className="up-avatar-badge">
              <svg fill="#0c1508" height="11" viewBox="0 0 256 256" width="11"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>
            </div>
          </div>

          {editingName ? (
            <div className="up-edit-form">
              <input autoFocus type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                placeholder={t('Your name', 'നിങ്ങളുടെ പേര്')} className="up-edit-input" />
              {nameMsg && <p style={{ fontSize:'0.78rem', fontWeight:600, margin:0, color: nameMsg.includes('!') ? '#68f91a' : '#e05555' }}>{nameMsg}</p>}
              <div className="up-edit-actions">
                <button onClick={saveName} className="up-save-btn">{t('Save', 'സേവ്')}</button>
                <button onClick={() => { setEditingName(false); setNameMsg(''); }} className="up-cancel-btn">{t('Cancel', 'റദ്ദാക്കുക')}</button>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
              <div className="up-name-row">
                <h2 className="up-name-text">{getDisplayName()}</h2>
                <button onClick={startEditName} className="up-edit-btn" title={t('Edit name', 'പേര് എഡിറ്റ്')}>
                  <svg fill="currentColor" height="14" viewBox="0 0 256 256" width="14"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188l84.68-84.69,16.69,16.69Z"/></svg>
                </button>
              </div>
              {user?.phoneNumber && (
                <div className="up-phone-chip">
                  <svg fill="currentColor" height="12" viewBox="0 0 256 256" width="12"><path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l-.06-.13L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46Z"/></svg>
                  {user.phoneNumber}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Menu ── */}
        <div style={{ marginTop: 28 }}>
          <p className="up-section-label">{t('Quick Access', 'ദ്രുത ആക്സസ്')}</p>
          <div className="up-menu-card">
            {menuItems.map((item, i) => (
              <React.Fragment key={i}>
                <Link to={item.link} className="up-menu-item">
                  <div className="up-menu-icon" style={{ background: item.iconBg, border: `1px solid ${item.iconBorder}`, color: item.iconColor }}>
                    {item.icon}
                  </div>
                  <p className="up-menu-label">{item.title}</p>
                  <span className="up-menu-chevron"><Chevron /></span>
                </Link>
                <div className="up-menu-divider" />
              </React.Fragment>
            ))}
            <button onClick={signOut} className="up-menu-item up-signout">
              <div className="up-menu-icon up-signout-icon">
                <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20"><path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L188.69,112H112a8,8,0,0,0,0,16h76.69l-18.35,18.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"/></svg>
              </div>
              <p className="up-menu-label">{t('Sign Out', 'സൈൻ ഔട്ട്')}</p>
              <span className="up-menu-chevron" style={{ color:'rgba(224,85,85,0.3)' }}><Chevron /></span>
            </button>
          </div>
        </div>

        <p style={{ textAlign:'center', color:'#2d4020', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.07em', marginTop:28, textTransform:'uppercase' }}>
          Yathrika · v1.0
        </p>
      </main>

      <footer className="up-footer">
        <nav className="up-footer-inner">
          <Link to="/yathrika-home" className="up-nav-item">
            <svg fill="currentColor" height="22" viewBox="0 0 256 256" width="22"><path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"/></svg>
            <span className="up-nav-label">{t('Home', 'ഹോം')}</span>
          </Link>
          <Link to="/order-history" className="up-nav-item">
            <svg fill="currentColor" height="22" viewBox="0 0 256 256" width="22"><path d="M72,104a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm8,40h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM232,56V208a8,8,0,0,1-11.58,7.15L192,200.94l-28.42,14.21a8,8,0,0,1-7.16,0L128,200.94,99.58,215.15a8,8,0,0,1-7.16,0L64,200.94,35.58,215.15A8,8,0,0,1,24,208V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Zm-16,0H40V195.06l20.42-10.22a8,8,0,0,1,7.16,0L96,199.06l28.42-14.22a8,8,0,0,1,7.16,0L160,199.06l28.42-14.22a8,8,0,0,1,7.16,0L216,195.06Z"/></svg>
            <span className="up-nav-label">{t('Orders', 'ഓർഡറുകൾ')}</span>
          </Link>
          <Link to="/user-profile" className="up-nav-item up-nav-active">
            <svg fill="currentColor" height="22" viewBox="0 0 256 256" width="22"><path d="M230.93,220a8,8,0,0,1-6.93,4H32a8,8,0,0,1-6.92-12c15.23-26.33,38.7-45.21,66.09-54.16a72,72,0,1,1,73.66,0c27.39,8.95,50.86,27.83,66.09,54.16A8,8,0,0,1,230.93,220Z"/></svg>
            <span className="up-nav-label">{t('Profile', 'പ്രൊഫൈൽ')}</span>
          </Link>
        </nav>
        <div className="up-footer-spacer" />
      </footer>
    </div>
  );
};

export default UserProfile;