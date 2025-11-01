import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import useNotificationWebSocket from '../hooks/useNotificationWebSocket';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  // Handle incoming WebSocket notification
  const handleWebSocketNotification = useCallback((notification) => {
    console.log('Received push notification:', notification);

    // Increment unread count
    setUnreadCount(prev => prev + 1);

    // Add to notifications list if not already there
    setNotifications(prev => {
      const exists = prev.some(n => n.id === notification.id);
      if (!exists) {
        return [notification, ...prev];
      }
      return prev;
    });

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
        badge: '/logo192.png'
      });
    }
  }, []);

  // Connect to WebSocket
  const { isConnected } = useNotificationWebSocket(handleWebSocketNotification);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId, true);

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );

      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // Find notification before deleting
      const notification = notifications.find(n => n.id === notificationId);

      await notificationsAPI.deleteNotification(notificationId);

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Decrement unread count if it was unread
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }, [notifications]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      const response = await notificationsAPI.getNotifications(params);
      setNotifications(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchUnreadCount();

    // Request browser notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      const requestPermission = () => {
        Notification.requestPermission().then(permission => {
          console.log('Notification permission:', permission);
        });
      };
      setTimeout(requestPermission, 3000);
    }
  }, [fetchUnreadCount]);

  const value = {
    unreadCount,
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    fetchUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
