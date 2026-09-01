import axiosInstance from '../axiosInstance';

export async function listPendingPhotos() {
  const { data } = await axiosInstance.get('/admin/photos/pending');
  return data.data.photos;
}

export async function approvePhoto(profileId, photoId) {
  const { data } = await axiosInstance.put(`/admin/photos/${profileId}/${photoId}/approve`);
  return data.data.profile;
}

export async function rejectPhoto(profileId, photoId, reason) {
  const { data } = await axiosInstance.put(`/admin/photos/${profileId}/${photoId}/reject`, { reason });
  return data.data.profile;
}
