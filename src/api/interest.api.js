import axiosInstance from './axiosInstance';

// ProfileCard / PublicProfile ka "Connect" button ye call karta hai.
export async function sendInterest(receiverId) {
  const { data } = await axiosInstance.post('/interests', { receiverId });
  return data.data.interest;
}

// Interests page (Received tab) ka Accept/Decline.
export async function respondToInterest(interestId, action) {
  const { data } = await axiosInstance.patch(`/interests/${interestId}/respond`, { action });
  return data.data.interest;
}

export async function getReceivedInterests() {
  const { data } = await axiosInstance.get('/interests/received');
  return data.data.interests;
}

export async function getSentInterests() {
  const { data } = await axiosInstance.get('/interests/sent');
  return data.data.interests;
}

export async function getMatches() {
  const { data } = await axiosInstance.get('/interests/matches');
  return data.data.matches;
}

// PublicProfile pe Connect button ka sahi state dikhane ke liye
// (Connect / Requested / Respond / Matched).
export async function getConnectionStatus(userId) {
  const { data } = await axiosInstance.get(`/interests/status/${userId}`);
  return data.data;
}
