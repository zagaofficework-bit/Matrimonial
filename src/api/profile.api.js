import axiosInstance from './axiosInstance';

export async function getMyProfile() {
  const { data } = await axiosInstance.get('/profile/me');
  return data.data.profile;
}

export async function saveMyProfile(payload) {
  const { data } = await axiosInstance.put('/profile/me', payload);
  return data.data.profile;
}

export async function browseProfiles() {
  const { data } = await axiosInstance.get('/profile/browse');
  return data.data.profiles;
}

export async function getProfileById(id) {
  const { data } = await axiosInstance.get(`/profile/${id}`);
  return data.data.profile;
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append('photo', file);
  // IMPORTANT: don't set Content-Type manually here. Axios/the browser needs
  // to generate it itself so it includes the multipart boundary - if you set
  // 'multipart/form-data' by hand (no boundary), the backend (multer) can't
  // parse the body and req.file comes back empty -> "NO_FILE_UPLOADED".
  const { data } = await axiosInstance.post('/profile/photos', formData);
  return data.data.profile;
}

export async function deleteProfilePhoto(photoId) {
  const { data } = await axiosInstance.delete(`/profile/photos/${photoId}`);
  return data.data.profile;
}

// Bio-data document (PDF / Word / Excel / CSV) upload karke usme se
// profile fields nikalne ke liye. Backend sirf preview deta hai - form
// values ko yahan se fill karke user khud check karke submit karta hai,
// koi seedha save nahi hota.
export async function importBioData(file) {
  const formData = new FormData();
  formData.append('document', file);
  // IMPORTANT: don't set Content-Type manually - same reason as photo
  // upload, browser needs to add the multipart boundary itself.
  const { data } = await axiosInstance.post('/profile/import-biodata', formData);
  return data.data.extractedFields;
}
