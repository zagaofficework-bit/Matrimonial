import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteAllNotifications,
  deleteNotification,
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../api/notification.api';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL_MS = 20000;

// Navbar bell ke liye - notifications + unread count, har 20 second me
// automatically refresh hota hai taaki naya "Connect" aane pe user ko
// bina reload kiye pata chal jaaye.
export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const timerRef = useRef(null);

  const refresh = useCallback(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    getMyNotifications()
      .then(setNotifications)
      .catch(() => {});

    getUnreadNotificationCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();

    if (!isAuthenticated) return undefined;

    timerRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [isAuthenticated, refresh]);

  const markRead = useCallback(async (notificationId) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback(async (notificationId) => {
    const target = notifications.find((n) => n._id === notificationId);
    await deleteNotification(notificationId);
    setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, [notifications]);

  const removeAllNotifications = useCallback(async () => {
    await deleteAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    refresh,
    markRead,
    markAllRead,
    removeNotification,
    removeAllNotifications
  };
}