// Basic Firebase setup using the modular SDK
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD_4WJ_s3S08a7xBwnkMo6HX2ulJTtZ0YY',
  authDomain: 'nuhoud-app.firebaseapp.com',
  projectId: 'nuhoud-app',
  storageBucket: 'nuhoud-app.firebasestorage.app',
  messagingSenderId: '473831186426',
  appId: '1:473831186426:web:c8c3822f228a056b68ce43',
  measurementId: 'G-0L8JWW4YKT',
};

// Replace this with the public VAPID key from Firebase console (Project settings -> Cloud Messaging)
const VAPID_KEY = process.env.REACT_APP_PUBLIC_VAPID_KEY;

// Initialize Firebase and Messaging once
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFcmToken = async (serviceWorkerRegistration) => {
  // Confirm the browser supports notifications
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return null;
  }

  // Ask the user for permission to show notifications
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission was not granted.');
    return null;
  }

  try {
    // Request the FCM registration token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (token) {
      console.log('FCM token:', token);
    } else {
      console.warn('No FCM token returned. Check your VAPID key and Firebase config.');
    }

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export { app, messaging };
