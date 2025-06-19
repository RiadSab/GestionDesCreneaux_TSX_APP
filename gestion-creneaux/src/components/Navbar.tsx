import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { NavbarProps } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/components/Navbar.css';

const Navbar: React.FC<NavbarProps> = ({ userName, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">{t('app.title')}</Link>
      </div>

      <div className="navbar-menu">
        <ul className="navbar-links">
          <li className={isActive('/dashboard') ? 'active' : ''}>
            <Link to="/dashboard">{t('nav.dashboard')}</Link>
          </li>
          <li className={isActive('/bookings') ? 'active' : ''}>
            <Link to="/bookings">{t('nav.bookings')}</Link>
          </li>
          <li className={isActive('/reserve') ? 'active' : ''}>
            <Link to="/reserve">{t('nav.reserve')}</Link>
          </li>
          <li className={isActive('/timeslots') ? 'active' : ''}>
            <Link to="/timeslots">{t('nav.availability')}</Link>
          </li>
        </ul>
      </div>

      <div className="navbar-actions">
        <div className="lang-switcher">
          <button
            onClick={() => setLanguage('en')}
            className={language === 'en' ? 'active' : ''}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('fr')}
            className={language === 'fr' ? 'active' : ''}
          >
            FR
          </button>
        </div>

        <div className="navbar-user">
          <div
            className="user-profile"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="user-name">{userName}</span>
            <span className="dropdown-icon">▼</span>
          </div>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">
                {t('nav.profile')}
              </Link>
              <Link to="/settings" className="dropdown-item">
                {t('nav.settings')}
              </Link>
              <div className="dropdown-divider"></div>
              <button
                onClick={handleLogout}
                className="dropdown-item logout-button"
              >
                {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
