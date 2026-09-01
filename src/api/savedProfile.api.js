import axiosInstance from './axiosInstance';

// ProfileCard ke bookmark button aur Saved Profiles page ke liye.
export async function saveProfile(profileId) {
  const { data } = await axiosInstance.post(`/saved-profiles/${profileId}`);
  return data.data.saved;
}

export async function unsaveProfile(profileId) {
  const { data } = await axiosInstance.delete(`/saved-profiles/${profileId}`);
  return data.data;
}

export async function getSavedProfiles() {
  const { data } = await axiosInstance.get('/saved-profiles');
  return data.data.savedProfiles;
}

// Search/Home page load hote hi ek baar call karo, phir har ProfileCard
// ko batao ki wo already saved hai ya nahi (id list se check karke).
export async function getSavedProfileIds() {
  const { data } = await axiosInstance.get('/saved-profiles/ids');
  return data.data.profileIds;
}
