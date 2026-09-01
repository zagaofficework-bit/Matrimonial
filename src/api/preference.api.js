import axiosInstance from './axiosInstance';

// GET /preferences/me - agar user ne kabhi preferences set nahi ki to backend
// 404 (PREFERENCE_NOT_FOUND) deta hai. Caller isko catch karke "not set yet"
// treat kare - error nahi hai, bas pehli baar hai.
export async function getMyPreferences() {
  const { data } = await axiosInstance.get('/preferences/me');
  return data.data.preference;
}

// PUT /preferences/me - create aur update dono isi se hote hain (upsert).
export async function saveMyPreferences(payload) {
  const { data } = await axiosInstance.put('/preferences/me', payload);
  return data.data.preference;
}