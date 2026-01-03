import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNotifications as useNotificationsApi } from '../hooks/useNotifications';

const NotificationsContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Paginated notifications from backend (cursor-based)
  const {
    notifications: apiNotifications,
    loadMore,
    hasMore,
    loading,
    error,
  } = useNotificationsApi(authToken, 5);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      const id = notification.id || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
      const next = [
        {
          id,
          title: notification.title || 'Notification',
          body: notification.body || '',
          data: notification.data || {},
          receivedAt: notification.receivedAt || new Date().toISOString(),
          read: false,
        },
        ...prev,
      ];
      return next;
    });
  }, []);

  // Sync API notifications into context state while preserving read flags and FCM adds.
  useEffect(() => {
    setNotifications((prev) => {
      const existingMap = new Map(prev.map((n) => [n.id, n]));

      const mappedApi = (apiNotifications || []).map((item) => {
        const prior = existingMap.get(item._id);
        return {
          id: item._id,
          title: item.title || 'Notification',
          body: item.body || '',
          data: item.data || {},
          receivedAt: item.createdAt || new Date().toISOString(),
          // Treat fetched notifications as read unless a newer local copy exists
          read: prior?.read ?? true,
        };
      });

      const apiIds = new Set(mappedApi.map((n) => n.id));
      const fcmOnly = prev.filter((n) => !apiIds.has(n.id));

      const merged = [...mappedApi, ...fcmOnly];
      merged.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
      return merged;
    });
  }, [apiNotifications]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      addNotification,
      markAllRead,
      clearNotifications,
      loadMore,
      hasMore,
      loading,
      error,
    }),
    [notifications, addNotification, markAllRead, clearNotifications, loadMore, hasMore, loading, error],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
};

export default NotificationsContext;
