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
    <div className="main-wrapper">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <Link to="/user-profile" className="text-gray-900 dark:text-white">
          <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
            <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
          </svg>
        </Link>
        <h1 className="flex-1 text-center text-xl font-bold text-gray-900 dark:text-white pr-6">
          Settings
        </h1>
      </header>

      <main className="flex-grow p-4 space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
              {group.title}
            </h2>
            <div className="bg-background-light dark:bg-background-dark/50 rounded-xl border border-gray-200/20 dark:border-gray-700/50 overflow-hidden">
              {group.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors ${
                    itemIndex !== group.items.length - 1 ? 'border-b border-gray-200/20 dark:border-gray-700/50' : ''
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-full">
                    <span className="material-symbols-outlined text-primary text-xl">
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <button className="w-full flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200/20 dark:border-red-700/50 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <div className="w-10 h-10 flex items-center justify-center bg-red-100 dark:bg-red-900/40 rounded-full">
              <span className="material-symbols-outlined text-red-500 text-xl">
                logout
              </span>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-red-600 dark:text-red-400">
                Sign Out
              </h3>
              <p className="text-sm text-red-500 dark:text-red-500">Log out of your account</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;