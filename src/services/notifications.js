import config from '../config/environment';

/**
 * @typedef {Object} Notification
 * @property {string} _id
 * @property {string} title
 * @property {string} body
 * @property {Record<string, string>} data
 * @property {string} createdAt
 */

/**
 * @typedef {Object} NotificationPage
 * @property {Notification[]} data
 * @property {string|null} nextCursor
 * @property {boolean} hasMore
 */

const NOTIFICATIONS_PATH = 'firebase/notifications';
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;

/**
 * Fetch notifications with cursor-based pagination.
 * @param {string} token
 * @param {string|null} [cursor]
 * @param {number} [limit=20]
 * @param {AbortSignal} [signal]
 * @returns {Promise<NotificationPage>}
 */
export const fetchNotifications = async (token, cursor, limit = DEFAULT_LIMIT, signal) => {
  if (!token) {
    throw new Error('Auth token is required to fetch notifications.');
  }

  const safeLimit = Math.min(Math.max(limit || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const baseUrl = (config.API_URL_MAIN || '').replace(/\/+$/, '');
  const url = new URL(NOTIFICATIONS_PATH, `${baseUrl}/`);
  url.searchParams.set('limit', String(safeLimit));
  if (cursor) {
    url.searchParams.set('cursor', cursor);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    let message = '';
    try {
      message = await response.text();
    } catch (error) {
      // ignore parsing errors
    }
    throw new Error(message || `Failed to fetch notifications (status ${response.status})`);
  }

  /** @type {NotificationPage} */
  const body = await response.json();
  return body;
};

export default fetchNotifications;
