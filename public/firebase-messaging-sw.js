// Firebase Cloud Messaging service worker for background notifications
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging-compat.js');

// Same config used in the React app
firebase.initializeApp({
  apiKey: 'AIzaSyD_4WJ_s3S08a7xBwnkMo6HX2ulJTtZ0YY',
  authDomain: 'nuhoud-app.firebaseapp.com',
  projectId: 'nuhoud-app',
  storageBucket: 'nuhoud-app.firebasestorage.app',
  messagingSenderId: '473831186426',
  appId: '1:473831186426:web:c8c3822f228a056b68ce43',
  measurementId: 'G-0L8JWW4YKT',
});

const messaging = firebase.messaging();

// Handle background messages (fires when the tab is closed or in the background)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'New notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: '/logo192.png', // Default CRA icon; change if desired
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
