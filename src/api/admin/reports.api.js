import axiosInstance from '../axiosInstance';

export async function listReports(params = {}) {
  const { data } = await axiosInstance.get('/admin/reports', { params });
  return data.data;
}

export async function getReport(id) {
  const { data } = await axiosInstance.get(`/admin/reports/${id}`);
  return data.data.report;
}

export async function updateReportStatus(id, status, blockReportedUser = false) {
  const { data } = await axiosInstance.put(`/admin/reports/${id}/status`, { status, blockReportedUser });
  return data.data.report;
}
