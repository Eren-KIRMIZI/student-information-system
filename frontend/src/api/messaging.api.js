import api from './axiosInstance';

export const getConversations = async () => {
  const response = await api.get('/messaging');
  return response.data;
};

export const getConversationMessages = async (id) => {
  const response = await api.get(`/messaging/${id}/messages`);
  return response.data;
};

export const sendMessage = async (id, content) => {
  const response = await api.post(`/messaging/${id}/messages`, { content });
  return response.data;
};

export const startConversation = async (targetUserId) => {
  const response = await api.post('/messaging', { targetUserId });
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/messaging/${id}/read`);
  return response.data;
};
