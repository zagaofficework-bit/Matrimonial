import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import './NotificationBell.css';

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Navbar me bell icon - notifications ka dropdown dikhata hai (interest
// aaya, match hua, interest reject hua). Har 20 second me poll hoke
// khud-ba-khud refresh hoti hai. Har item par delete (X) button hai,
// aur header me "Clear all" button hai jo saari notifications hata deta hai.
export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, removeNotification, removeAllNotifications } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleNotificationClick(notification) {
    if (!notification.isRead) {
      markRead(notification._id).catch(() => {});
    }
    setOpen(false);
    if (notification.type === 'match') {
      navigate('/matches');
    } else {
      navigate('/interests');
    }
  }

  function handleDeleteClick(e, notificationId) {
    e.stopPropagation();
    removeNotification(notificationId).catch(() => {});
  }

  function handleClearAll() {
    removeAllNotifications().catch(() => {});
  }

  return (
    <div className="notif-bell" ref={menuRef}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Notifications</span>
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button type="button" className="notif-mark-all" onClick={() => markAllRead().catch(() => {})}>
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button type="button" className="notif-clear-all" onClick={handleClearAll}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <p className="notif-empty">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notif-item ${notification.isRead ? '' : 'notif-item-unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notif-item-content">
                    <p className="notif-message">{notification.message}</p>
                    <span className="notif-time">{timeAgo(notification.createdAt)}</span>
                  </div>
                  <button
                    type="button"
                    className="notif-delete-btn"
                    aria-label="Delete notification"
                    onClick={(e) => handleDeleteClick(e, notification._id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}