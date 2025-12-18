import { useEffect } from 'react';
import { isSupported, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import { useNotifications } from '../context/NotificationsContext';

const mapPayloadToNotification = (payload) => {
  const notification = payload?.notification || {};
  const data = payload?.data || {};

  return {
    title: notification.title || data.title || 'Notification',
    body: notification.body || data.body || '',
    data,
    receivedAt: new Date().toISOString(),
  };
};

export const useFcmForegroundNotifications = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    let unsubscribe = () => {};

    const init = async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          console.warn('Firebase messaging is not supported in this browser.');
          return;
        }

        unsubscribe = onMessage(messaging, (payload) => {
          const mapped = mapPayloadToNotification(payload);
          addNotification(mapped);
        });
      } catch (error) {
        console.error('Failed to set up FCM foreground listener:', error);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [addNotification]);
};

export default useFcmForegroundNotifications;
