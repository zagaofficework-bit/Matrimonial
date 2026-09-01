import axiosInstance from './axiosInstance';

// ProfileCard / PublicProfile ka "Connect" button ye call karta hai.
// Backend route: POST /interests/:userId  (receiverId URL param me jaata hai, body me nahi)
export async function sendInterest(receiverId) {
  const { data } = await axiosInstance.post(`/interests/${receiverId}`);
  return data.data.interest;
}

// Interests page (Received tab) + PublicProfile ka Accept/Decline.
// Backend me ek generic '/respond' route nahi hai - alag alag
// '/accept' aur '/decline' routes hain (PUT), 'reject' nahi 'decline'.
export async function respondToInterest(interestId, action) {
  const endpointAction = action === 'reject' ? 'decline' : action;
  const { data } = await axiosInstance.put(`/interests/${interestId}/${endpointAction}`);
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