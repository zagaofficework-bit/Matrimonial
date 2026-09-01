import axiosInstance from '../axiosInstance';

export async function listPendingVerifications(params = {}) {
  const { data } = await axiosInstance.get('/admin/verifications', { params });
  return data.data;
}

export async function verifyProfile(id) {
  const { data } = await axiosInstance.put(`/admin/verifications/${id}/verify`);
  return data.data.profile;
}

export async function rejectProfile(id, reason) {
  const { data } = await axiosInstance.put(`/admin/verifications/${id}/reject`, { reason });
  return data.data.profile;
}
