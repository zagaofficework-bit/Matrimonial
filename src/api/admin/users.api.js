import axiosInstance from '../axiosInstance';

export async function listUsers(params = {}) {
  const { data } = await axiosInstance.get('/admin/users', { params });
  return data.data;
}

export async function getUserDetail(id) {
  const { data } = await axiosInstance.get(`/admin/users/${id}`);
  return data.data;
}

export async function suspendUser(id) {
  const { data } = await axiosInstance.put(`/admin/users/${id}/suspend`);
  return data.data.user;
}

export async function activateUser(id) {
  const { data } = await axiosInstance.put(`/admin/users/${id}/activate`);
  return data.data.user;
}

export async function blockUser(id) {
  const { data } = await axiosInstance.put(`/admin/users/${id}/block`);
  return data.data.user;
}

export async function unblockUser(id) {
  const { data } = await axiosInstance.put(`/admin/users/${id}/unblock`);
  return data.data.user;
}

export async function deleteUser(id) {
  const { data } = await axiosInstance.delete(`/admin/users/${id}`);
  return data.data.user;
}

export async function changeUserRole(id, role) {
  const { data } = await axiosInstance.put(`/admin/users/${id}/change-role`, { role });
  return data.data.user;
}
