import axiosInstance from '../axiosInstance';

export async function getDashboardStats() {
  const { data } = await axiosInstance.get('/admin/dashboard/stats');
  return data.data.stats;
}
