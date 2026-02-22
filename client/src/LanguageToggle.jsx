import React from 'react';
import { useLanguage } from './LanguageContext';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="language-toggle-btn"
      title={language === 'en' ? 'Switch to Malayalam' : 'മലയാളത്തിലേക്ക് മാറുക'}
      aria-label={language === 'en' ? 'Switch to Malayalam' : 'Switch to English'}
    >
      <span className="material-symbols-outlined language-toggle-icon">language</span>
      <span className="language-toggle-label">
        {language === 'en' ? 'ML' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;