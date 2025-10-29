import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getThemeClass = () => {
    if (location.pathname.startsWith('/shopping')) {
      return 'theme-shopping';
    } else if (location.pathname.startsWith('/expenses')) {
      return 'theme-expenses';
    } else if (location.pathname.startsWith('/gym')) {
      return 'theme-gym';
    }
    return 'theme-default';
  };

  return (
    <nav className={`navbar-modern ${getThemeClass()}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">📊</span>
            <span className="brand-text">Gestionale</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="navbar-menu">
          <Link
            to="/"
            className={`nav-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </Link>
          <Link
            to="/expenses"
            className={`nav-link ${isActive('/expenses') ? 'active' : ''}`}
          >
            <span className="nav-icon">💰</span>
            <span>Spese</span>
          </Link>
          <Link
            to="/shopping"
            className={`nav-link ${isActive('/shopping') ? 'active' : ''}`}
          >
            <span className="nav-icon">🛒</span>
            <span>Lista Spesa</span>
          </Link>
          <Link
            to="/gym"
            className={`nav-link ${isActive('/gym') ? 'active' : ''}`}
          >
            <span className="nav-icon">💪</span>
            <span>Palestra</span>
          </Link>
          <Link
            to="/help"
            className={`nav-link ${isActive('/help') ? 'active' : ''}`}
          >
            <span className="nav-icon">📚</span>
            <span>Aiuto</span>
          </Link>
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <div className="navbar-user" ref={dropdownRef}>
          <div
            className="user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.nome?.charAt(0)}{user?.cognome?.charAt(0)}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.nome} {user?.cognome}</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <span className="dropdown-arrow">▼</span>
          </div>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-item user-profile-item">
                <div className="user-avatar-large">
                  {user?.nome?.charAt(0)}{user?.cognome?.charAt(0)}
                </div>
                <div>
                  <div className="dropdown-user-name">{user?.nome} {user?.cognome}</div>
                  <div className="dropdown-user-email">{user?.email}</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                <span>👤</span>
                <span>Profilo</span>
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <span>🚪</span>
                <span>Esci</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
