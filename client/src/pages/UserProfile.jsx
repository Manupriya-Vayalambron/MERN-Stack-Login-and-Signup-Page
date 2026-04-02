import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';
import '../index.css';

const UserProfile = () => {
  const { language } = useLanguage();
  const { user, getDisplayName, updateUserName, signOut } = useUser();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameMsg, setNameMsg] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const t = (en, ml) => (language === 'en' ? en : ml);

  const startEditName = () => {
    setNameInput(user?.name || '');
    setNameMsg('');
    setEditingName(true);
  };

  const cancelEditName = () => {
    setEditingName(false);
    setNameMsg('');
  };

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameMsg(t('Name cannot be empty.', 'പേര് ശൂന്യമാകരുത്.'));
      return;
    }

    setIsSavingName(true);
    const result = await updateUserName(trimmed);
    setIsSavingName(false);

    if (!result?.success) {
      setNameMsg(result?.error || t('Failed to update name.', 'പേര് അപ്ഡേറ്റ് ചെയ്യാനായില്ല.'));
      return;
    }

    setNameMsg(t('Name updated!', 'പേര് അപ്ഡേറ്റ് ചെയ്തു!'));
    setTimeout(() => {
      setEditingName(false);
      setNameMsg('');
    }, 900);
  };

  const initials = user?.name
    ? user.name
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user?.phoneNumber?.slice(-2) || 'U';

  return (
    <div className="settings-page-container">
      <div className="settings-content-wrapper">
        <header className="settings-header">
          <div className="settings-header-inner">
            <Link to="/yathrika-home" className="settings-back-button" aria-label="Back">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
              </svg>
            </Link>
            <h1 className="settings-page-title">{t('Profile', 'പ്രൊഫൈൽ')}</h1>
          </div>
        </header>

        <main className="settings-main-content">
          <section className="settings-preferences-section">
            <h2 className="settings-section-title">{t('Account', 'അക്കൗണ്ട്')}</h2>
            <div className="settings-group-container">
              <div className="settings-item" style={{ alignItems: 'flex-start' }}>
                <div className="settings-item-icon" style={{ fontWeight: 800, fontSize: 18 }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  {!editingName ? (
                    <>
                      <p className="settings-item-title" style={{ marginBottom: 4 }}>{getDisplayName()}</p>
                      <p className="settings-item-subtitle" style={{ marginBottom: 8 }}>{user?.phoneNumber || '—'}</p>
                      <button
                        type="button"
                        onClick={startEditName}
                        style={{
                          border: '1px solid rgba(104,249,26,0.35)',
                          background: 'rgba(255,255,255,0.04)',
                          color: '#e5e7eb',
                          borderRadius: 10,
                          padding: '6px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {t('Edit Name', 'പേര് തിരുത്തുക')}
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        autoFocus
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveName();
                          if (e.key === 'Escape') cancelEditName();
                        }}
                        placeholder={t('Your name', 'നിങ്ങളുടെ പേര്')}
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(104,249,26,0.35)',
                          borderRadius: 10,
                          padding: '10px 12px',
                          color: '#fff',
                          marginBottom: 8,
                          outline: 'none'
                        }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={saveName}
                          disabled={isSavingName}
                          style={{
                            border: 'none',
                            background: '#68f91a',
                            color: '#16230f',
                            borderRadius: 10,
                            padding: '8px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: isSavingName ? 'default' : 'pointer'
                          }}
                        >
                          {isSavingName ? t('Saving...', 'സേവ് ചെയ്യുന്നു...') : t('Save', 'സേവ്')}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditName}
                          disabled={isSavingName}
                          style={{
                            border: '1px solid rgba(255,255,255,0.14)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#d1d5db',
                            borderRadius: 10,
                            padding: '8px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: isSavingName ? 'default' : 'pointer'
                          }}
                        >
                          {t('Cancel', 'റദ്ദാക്കുക')}
                        </button>
                      </div>
                    </>
                  )}
                  {nameMsg && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.76rem', color: nameMsg.includes('!') ? '#68f91a' : '#ff7373' }}>
                      {nameMsg}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="settings-support-section">
            <h2 className="settings-section-title">{t('Quick Access', 'ദ്രുത ആക്സസ്')}</h2>
            <div className="settings-group-container">
              <Link to="/settings" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="settings-item-icon">
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M234.6,129.9l-16.6-9.6c.2-2.2.3-4.2.3-6.3s-.1-4.1-.3-6.3l16.6-9.6a8,8,0,0,0,3.2-10.8l-16-27.7a8,8,0,0,0-10.3-3.5l-17.4,7.1a94.9,94.9,0,0,0-10.9-6.3l-2.6-18.7A8,8,0,0,0,172.7,32H140.7a8,8,0,0,0-7.9,6.8l-2.6,18.7a94.9,94.9,0,0,0-10.9,6.3L101.9,56a8,8,0,0,0-10.3,3.5l-16,27.7a8,8,0,0,0,3.2,10.8l16.6,9.6c-.2,2.2-.3,4.2-.3,6.3s.1,4.1.3,6.3L78.8,129.9a8,8,0,0,0-3.2,10.8l16,27.7a8,8,0,0,0,10.3,3.5l17.4-7.1a94.9,94.9,0,0,0,10.9,6.3l2.6,18.7a8,8,0,0,0,7.9,6.8h32a8,8,0,0,0,7.9-6.8l2.6-18.7a94.9,94.9,0,0,0,10.9-6.3l17.4,7.1a8,8,0,0,0,10.3-3.5l16-27.7A8,8,0,0,0,234.6,129.9ZM156.7,114a24,24,0,1,1-24-24A24,24,0,0,1,156.7,114Z"></path>
                  </svg>
                </div>
                <p className="settings-item-title-solo">{t('Settings', 'ക്രമീകരണങ്ങൾ')}</p>
                <svg className="settings-chevron-icon" fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                </svg>
              </Link>

              <Link to="/support" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="settings-item-icon">
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Z"></path>
                  </svg>
                </div>
                <p className="settings-item-title-solo">{t('Help & Support', 'സഹായവും പിന്തുണയും')}</p>
                <svg className="settings-chevron-icon" fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                </svg>
              </Link>

              <button onClick={signOut} className="settings-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}>
                <div className="settings-item-icon" style={{ backgroundColor: 'rgba(224,85,85,0.15)', color: '#ff7373' }}>
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L188.69,112H112a8,8,0,0,0,0,16h76.69l-18.35,18.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"></path>
                  </svg>
                </div>
                <p className="settings-item-title-solo" style={{ color: '#ff7373' }}>{t('Sign Out', 'സൈൻ ഔട്ട്')}</p>
              </button>
            </div>
          </section>
        </main>
      </div>

      <footer className="settings-footer-nav">
        <div className="settings-nav-container">
          <Link className="settings-nav-item" to="/yathrika-home">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77Z"></path>
            </svg>
            <span className="settings-nav-text">{t('Home', 'ഹോം')}</span>
          </Link>
          <Link className="settings-nav-item" to="/order-history">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M247.42,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,247.42,117Z"></path>
            </svg>
            <span className="settings-nav-text">{t('Orders', 'ഓർഡറുകൾ')}</span>
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
            <span className="settings-nav-text settings-nav-text-active">{t('Profile', 'പ്രൊഫൈൽ')}</span>
          </Link>
        </div>
        <div className="settings-nav-spacer"></div>
      </footer>
    </div>
  );
};

export default UserProfile;
