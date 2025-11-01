import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import './NotificationBell.css';

const NotificationBell = () => {
  const { unreadCount, isConnected } = useNotifications();
  const navigate = useNavigate();

  const handleBellClick = () => {
    navigate('/notifications');
  };

  return (
    <div className="notification-bell">
      <button
        className="notification-bell-button"
        onClick={handleBellClick}
        aria-label="Notifiche"
        title={isConnected ? "Notifiche in tempo reale attive" : "Connessione in corso..."}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {isConnected && <span className="notification-connection-indicator"></span>}
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;
