import axiosInstance from '../axiosInstance';

export async function listAuditLogs(params = {}) {
  const { data } = await axiosInstance.get('/admin/audit-logs', { params });
  return data.data;
}
