import React, { useState } from 'react';
import { UserSettings, SettingsPageProps } from '../types/types';
import '../styles/components/SettingsPage.css';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';

const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onUpdateUser,
}) => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<UserSettings>({
    account: {
      name: currentUser.name || '',
      email: currentUser.email || '',
    },
    notifications: {
      email: true,
      browser: true,
    },
  });

  const [activeSection, setActiveSection] = useState<
    'account' | 'notifications'
  >('account');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordMismatch') || 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t('settings.passwordTooShort') || 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      alert(t('settings.passwordChanged') || 'Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(t('settings.passwordChangeError') || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked,
      },
    }));
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'email') {
      setEmailError('');
    }

    setSettings((prev) => ({
      ...prev,
      account: {
        ...prev.account,
        [name]: value,
      },
    }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t('settings.invalidEmail') || 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const saveSettings = async () => {
    if (settings.account.email && !validateEmail(settings.account.email)) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      onUpdateUser({
        name: settings.account.name,
        email: settings.account.email,
      });

      alert(t('settings.saveSuccess') || 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t('settings.saveError') || 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="settings-container">
        <LoadingSpinner />
        <p>{t('app.loading') || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>{t('settings.title') || 'Settings'}</h1>
      </header>

      <div className="settings-content">
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <button
              className={`nav-item ${
                activeSection === 'account' ? 'active' : ''
              }`}
              onClick={() => setActiveSection('account')}
            >
              {t('settings.account') || 'Account'}
            </button>
            <button
              className={`nav-item ${
                activeSection === 'notifications' ? 'active' : ''
              }`}
              onClick={() => setActiveSection('notifications')}
            >
              {t('settings.notifications') || 'Notifications'}
            </button>
          </nav>
        </aside>

        <main className="settings-main">
          {activeSection === 'account' && (
            <section className="settings-section">
              <h2>{t('settings.accountSettings') || 'Account Settings'}</h2>

              <div className="account-form">
                <div className="form-group">
                  <label htmlFor="name">{t('settings.username') || 'Username'}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={settings.account.name}
                    onChange={handleAccountChange}
                    placeholder={t('settings.usernamePlaceholder') || 'Username'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('settings.emailAddress') || 'Email Address'}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={settings.account.email}
                    onChange={handleAccountChange}
                    placeholder={t('settings.emailPlaceholder') || 'your.email@example.com'}
                    className={emailError ? 'input-error' : ''}
                  />
                  {emailError && (
                    <div className="error-message">
                      {emailError}
                    </div>
                  )}
                </div>

                <button
                  className="save-settings-button"
                  onClick={saveSettings}
                  disabled={isLoading}
                >
                  {isLoading ? (t('settings.saving') || 'Saving...') : (t('settings.saveChanges') || 'Save Changes')}
                </button>
              </div>

              <div className="password-section">
                <h3>{t('settings.changePassword') || 'Change Password'}</h3>
                <form onSubmit={handlePasswordChange}>
                  {passwordError && (
                    <div className="error-message">{passwordError}</div>
                  )}

                  <div className="form-group">
                    <label htmlFor="currentPassword">{t('settings.currentPassword') || 'Current Password'}</label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">{t('settings.newPassword') || 'New Password'}</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      {t('settings.confirmPassword') || 'Confirm New Password'}
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="change-password-button"
                    disabled={isLoading}
                  >
                    {isLoading ? (t('settings.changing') || 'Changing...') : (t('settings.changePassword') || 'Change Password')}
                  </button>
                </form>
              </div>
            </section>
          )}

          {activeSection === 'notifications' && (
            <section className="settings-section">
              <h2>{t('settings.notificationSettings') || 'Notification Settings'}</h2>

              <div className="settings-options">
                <div className="settings-option">
                  <div className="option-text">
                    <h3>{t('settings.emailNotifications') || 'Email Notifications'}</h3>
                    <p>{t('settings.emailNotificationsDesc') || 'Receive booking confirmations and reminders via email'}</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="email"
                      checked={settings.notifications.email}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option">
                  <div className="option-text">
                    <h3>{t('settings.browserNotifications') || 'Browser Notifications'}</h3>
                    <p>{t('settings.browserNotificationsDesc') || 'Receive notifications in your web browser'}</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="browser"
                      checked={settings.notifications.browser}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <button
                  className="save-settings-button"
                  onClick={saveSettings}
                  disabled={isLoading}
                >
                  {isLoading ? (t('settings.saving') || 'Saving...') : (t('settings.saveChanges') || 'Save Changes')}
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
