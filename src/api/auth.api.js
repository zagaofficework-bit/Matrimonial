import axiosInstance from './axiosInstance';

export async function registerUser(payload) {
  const { data } = await axiosInstance.post('/auth/register', payload);
  return data.data; // { user, tokens }
}

export async function loginUser(identifier, password) {
  const { data } = await axiosInstance.post('/auth/login', { identifier, password });
  return data.data; // { user, tokens }
}

export async function forgotPassword(email) {
  const { data } = await axiosInstance.post('/auth/forgot-password', { email });
  return data.data;
}

export async function resetPasswordWithToken(token, newPassword) {
  const { data } = await axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
  return data.data;
}