import axiosInstance from './axiosInstance';

export async function getMyNotifications() {
  const { data } = await axiosInstance.get('/notifications');
  return data.data.notifications;
}

export async function getUnreadNotificationCount() {
  const { data } = await axiosInstance.get('/notifications/unread-count');
  return data.data.count;
}

export async function markNotificationAsRead(notificationId) {
  const { data } = await axiosInstance.patch(`/notifications/${notificationId}/read`);
  return data.data.notification;
}

export async function markAllNotificationsAsRead() {
  await axiosInstance.patch('/notifications/mark-all-read');
}
