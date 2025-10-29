import React, { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import useNotificationWebSocket from '../hooks/useNotificationWebSocket';
import './NotificationBell.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Handle incoming WebSocket notification
  const handleWebSocketNotification = useCallback((notification) => {
    console.log('Received push notification:', notification);

    // Increment unread count
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
        badge: '/logo192.png'
      });
    }
  }, []);

  // Connect to WebSocket for real-time notifications
  const { isConnected } = useNotificationWebSocket(handleWebSocketNotification);

  // Initial fetch on mount and request browser notification permission
  useEffect(() => {
    fetchUnreadCount();

    // Request browser notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      // Only request after user interaction to avoid being intrusive
      const requestPermission = () => {
        Notification.requestPermission().then(permission => {
          console.log('Notification permission:', permission);
        });
      };

      // Request permission after a small delay
      setTimeout(requestPermission, 3000);
    }
  }, []);

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
