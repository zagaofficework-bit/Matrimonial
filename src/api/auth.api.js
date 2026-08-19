import axiosInstance from './axiosInstance';

export async function registerUser(payload) {
  const { data } = await axiosInstance.post('/auth/register', payload);
  return data.data; // { user, tokens }
}

export async function loginUser(identifier, password) {
  const { data } = await axiosInstance.post('/auth/login', { identifier, password });
  return data.data; // { user, tokens }
}
