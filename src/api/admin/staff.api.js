import axiosInstance from '../axiosInstance';

export async function listStaff() {
  const { data } = await axiosInstance.get('/admin/staff');
  return data.data.staff;
}

export async function assignStaffRole(id, role, permissions) {
  const { data } = await axiosInstance.put(`/admin/staff/${id}/role`, { role, permissions });
  return data.data.user;
}

export async function revokeStaffAccess(id) {
  const { data } = await axiosInstance.put(`/admin/staff/${id}/revoke`);
  return data.data.user;
}
