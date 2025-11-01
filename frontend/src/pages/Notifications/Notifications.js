import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import './Notifications.css';

const Notifications = () => {
  const {
    notifications: contextNotifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const navigate = useNavigate();

  // Fetch notifications on mount and filter change
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const params = filter === 'unread' ? { unread_only: true } : {};
        await fetchNotifications(params);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [filter, fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate to related page
    if (notification.reference_type === 'shopping_list' && notification.reference_id) {
      navigate(`/shopping/${notification.reference_id}`);
    } else if (notification.reference_type === 'expense_group' && notification.reference_id) {
      navigate(`/expenses/groups/${notification.reference_id}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins}m fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}g fa`;
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const unreadCount = contextNotifications.filter(n => !n.is_read).length;
  const filteredNotifications = filter === 'unread'
    ? contextNotifications.filter(n => !n.is_read)
    : contextNotifications;

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ marginBottom: '1rem' }}
        >
          ← Indietro
        </button>

        <div className="notifications-header-page">
          <div className="notifications-title-section">
            <h1>Notifiche</h1>
            {isConnected && (
              <span className="connection-status">
                <span className="connection-dot"></span>
                In tempo reale
              </span>
            )}
          </div>

          <div className="notifications-actions">
            {unreadCount > 0 && (
              <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
                Segna tutte come lette ({unreadCount})
              </button>
            )}
          </div>
        </div>

        <div className="notifications-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tutte ({contextNotifications.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Non lette ({unreadCount})
          </button>
        </div>

        <div className="notifications-list-page">
          {loading ? (
            <div className="notifications-loading">
              <div className="spinner"></div>
              <p>Caricamento...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <h3>Nessuna notifica</h3>
              <p>{filter === 'unread' ? 'Non hai notifiche non lette' : 'Non hai ancora ricevuto notifiche'}</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-card-content">
                  <div className="notification-card-header">
                    <h3 className="notification-card-title">{notification.title}</h3>
                    <button
                      className="notification-delete-btn"
                      onClick={(e) => handleDeleteNotification(e, notification.id)}
                      title="Elimina notifica"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="notification-card-message">{notification.message}</p>
                  <div className="notification-card-footer">
                    <span className="notification-card-time">{formatTime(notification.created_at)}</span>
                    {!notification.is_read && <span className="notification-unread-badge">Nuovo</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
