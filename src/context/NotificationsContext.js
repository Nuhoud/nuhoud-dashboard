import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NotificationsContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

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
      // Keep a reasonable history to avoid unbounded growth
      return next.slice(0, 50);
    });
  }, []);

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
    }),
    [notifications, addNotification, markAllRead, clearNotifications],
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
