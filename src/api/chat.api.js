import axiosInstance from './axiosInstance';

// Chat page load hote hi left panel - saari conversations
export async function getConversations() {
  const { data } = await axiosInstance.get('/chat/conversations');
  return data.data.conversations;
}

// PublicProfile ke "Message" button se - matched user ke saath conversation
// khol/bana deta hai
export async function startConversation(userId) {
  const { data } = await axiosInstance.post(`/chat/conversations/${userId}`);
  return data.data.conversation;
}

// Right panel - ek conversation ki purani messages
export async function getMessages(conversationId, before) {
  const { data } = await axiosInstance.get(`/chat/conversations/${conversationId}/messages`, {
    params: before ? { before } : {}
  });
  return data.data.messages;
}

// Socket.IO down ho tab bhi message bhej sake, isliye REST fallback
export async function sendMessageRest(conversationId, text) {
  const { data } = await axiosInstance.post(`/chat/conversations/${conversationId}/messages`, { text });
  return data.data.message;
}

export async function markConversationRead(conversationId) {
  await axiosInstance.patch(`/chat/conversations/${conversationId}/read`);
}
