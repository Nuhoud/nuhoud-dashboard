import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchNotifications } from '../services/notifications';

/**
 * Hook to consume paginated notifications from the backend.
 * @param {string|null|undefined} authToken
 * @param {number} [pageSize=20]
 */
export const useNotifications = (authToken, pageSize = 20) => {
  const [notifications, setNotifications] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const loadPage = useCallback(
    async (cursorValue, append) => {
      if (!authToken) {
        setNotifications([]);
        setHasMore(false);
        return;
      }

      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const page = await fetchNotifications(authToken, cursorValue, pageSize, controller.signal);
        setNotifications((prev) => (append ? [...prev, ...page.data] : page.data));
        setCursor(page.nextCursor);
        setHasMore(Boolean(page.hasMore));
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [authToken, pageSize],
  );

  useEffect(() => {
    setNotifications([]);
    setCursor(null);
    setHasMore(true);
    setError(null);

    loadPage(null, false);

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [authToken, pageSize, loadPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || !authToken) return;
    loadPage(cursor, true);
  }, [authToken, cursor, hasMore, loading, loadPage]);

  return { notifications, loadMore, hasMore, loading, error, cursor };
};

export default useNotifications;
