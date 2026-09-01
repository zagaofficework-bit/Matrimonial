import axiosInstance from './axiosInstance';

// Homepage slider - latest 3 stories
export async function getFeaturedStories() {
  const { data } = await axiosInstance.get('/success-stories/featured');
  return data.data.stories;
}

// "Success Stories" page - "View More" click, paginated grid
export async function listStories(page = 1, limit = 9) {
  const { data } = await axiosInstance.get('/success-stories', { params: { page, limit } });
  return data.data;
}

// Ek story pe click - full story page
export async function getStoryById(id) {
  const { data } = await axiosInstance.get(`/success-stories/${id}`);
  return data.data.story;
}

// Admin - apni banayi hui stories (Edit Story / Add More Story list ke liye)
export async function getMyStories() {
  const { data } = await axiosInstance.get('/success-stories/mine');
  return data.data.stories;
}

// Kisi member ki profile pe unki (creator ya tagged partner) stories dikhane ke liye
export async function getStoriesByUserId(userId) {
  if (!userId) return [];
  const { data } = await axiosInstance.get(`/success-stories/user/${userId}`);
  return data.data.stories;
}

// Admin - naya story add karna. partnerEmail optional hai - diya ho to us
// member ke account pe bhi ye story dikhegi.
export async function createStory({ coupleNames, story, storyDate, partnerEmail, image }) {
  const formData = new FormData();
  formData.append('coupleNames', coupleNames);
  formData.append('story', story);
  formData.append('storyDate', storyDate);
  if (partnerEmail) formData.append('partnerEmail', partnerEmail);
  if (image) formData.append('image', image);

  // IMPORTANT: Content-Type manually set mat karo - browser boundary khud add karta hai.
  const { data } = await axiosInstance.post('/success-stories', formData);
  return data.data.story;
}

// Admin - existing story update karna
export async function updateStory(id, { coupleNames, story, storyDate, partnerEmail, image }) {
  const formData = new FormData();
  if (coupleNames !== undefined) formData.append('coupleNames', coupleNames);
  if (story !== undefined) formData.append('story', story);
  if (storyDate !== undefined) formData.append('storyDate', storyDate);
  if (partnerEmail !== undefined) formData.append('partnerEmail', partnerEmail);
  if (image) formData.append('image', image);

  const { data } = await axiosInstance.put(`/success-stories/${id}`, formData);
  return data.data.story;
}