import axiosInstance from '../axiosInstance';

export async function getRevenueAnalytics() {
  const { data } = await axiosInstance.get('/admin/revenue/analytics');
  return data.data.analytics;
}

export async function listTransactions(params = {}) {
  const { data } = await axiosInstance.get('/admin/revenue/transactions', { params });
  return data.data;
}
