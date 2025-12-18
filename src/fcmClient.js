// FCM helper that runs only after login
import { requestFcmToken } from './firebase';
import { getAuthHeaders,SendFCMtokentobackend } from './services/api'; // uses localStorage token

// Keep track of the last token sent in this session (in-memory only)
let lastSentToken = null;

// Register SW, get FCM token, and send it to the backend
export const registerAndSendFcmToken = async () => {
  try {
    
    // Get JWT from localStorage via helper
    const authHeaders = getAuthHeaders();
    const hasJwt = authHeaders && authHeaders.Authorization;
    if (!hasJwt) {
      console.warn('No JWT found. Skipping FCM registration.');
      return;
    }

    // Check SW support
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported in this browser.');
      return;
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('FCM service worker registered:', registration.scope);

    
    // Request permission + get token
    const token = await requestFcmToken(registration);
    if (!token) {
      console.warn('No FCM token received.');
      return;
    }
    // Avoid sending same token twice in this session
    /*if (token === lastSentToken) {
      console.log('FCM token already sent this session, skipping.');
      return;
    }*/

    // Send token to backend
    const response = await SendFCMtokentobackend({ token, platform: 'web' });
    console.log('this is the response:', response);

    lastSentToken = token;
    console.log('FCM token sent to backend.');
  } catch (error) {
    console.error('FCM registration/send failed:', error);
  }
};

export default registerAndSendFcmToken;
