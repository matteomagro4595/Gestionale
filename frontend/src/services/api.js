import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

// Users APIs
export const usersAPI = {
  getUsers: () => api.get('/api/users'),
  getUser: (id) => api.get(`/api/users/${id}`),
};

// Expenses APIs
export const expensesAPI = {
  // Groups
  createGroup: (data) => api.post('/api/expenses/groups', data),
  getGroups: () => api.get('/api/expenses/groups'),
  getGroup: (id) => api.get(`/api/expenses/groups/${id}`),
  getGroupByToken: (token) => api.get(`/api/expenses/groups/shared/${token}`),
  updateGroup: (id, data) => api.put(`/api/expenses/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/api/expenses/groups/${id}`),

  // Group members
  addMember: (groupId, data) => api.post(`/api/expenses/groups/${groupId}/members`, data),
  removeMember: (groupId, userId) => api.delete(`/api/expenses/groups/${groupId}/members/${userId}`),

  // Expenses
  createExpense: (data) => api.post('/api/expenses/expenses', data),
  getExpenses: (groupId) => api.get('/api/expenses/expenses', { params: { group_id: groupId } }),
  getExpense: (id) => api.get(`/api/expenses/expenses/${id}`),
  updateExpense: (id, data) => api.put(`/api/expenses/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/api/expenses/expenses/${id}`),

  // Balances
  getBalances: (groupId) => api.get(`/api/expenses/groups/${groupId}/balances`),
};

// Shopping Lists APIs
export const shoppingAPI = {
  createList: (data) => api.post('/api/shopping-lists/', data),
  getLists: () => api.get('/api/shopping-lists/'),
  getList: (id) => api.get(`/api/shopping-lists/${id}`),
  getListByToken: (token) => api.get(`/api/shopping-lists/shared/${token}`),
  updateList: (id, data) => api.put(`/api/shopping-lists/${id}`, data),
  deleteList: (id) => api.delete(`/api/shopping-lists/${id}`),

  // Items
  createItem: (listId, data) => api.post(`/api/shopping-lists/${listId}/items`, data),
  updateItem: (listId, itemId, data) => api.put(`/api/shopping-lists/${listId}/items/${itemId}`, data),
  deleteItem: (listId, itemId) => api.delete(`/api/shopping-lists/${listId}/items/${itemId}`),
};

// Gym APIs
export const gymAPI = {
  createCard: (data) => api.post('/api/gym/cards', data),
  getCards: () => api.get('/api/gym/cards'),
  getCard: (id) => api.get(`/api/gym/cards/${id}`),
  updateCard: (id, data) => api.put(`/api/gym/cards/${id}`, data),
  deleteCard: (id) => api.delete(`/api/gym/cards/${id}`),

  // Exercises
  createExercise: (cardId, data) => api.post(`/api/gym/cards/${cardId}/exercises`, data),
  updateExercise: (cardId, exerciseId, data) => api.put(`/api/gym/cards/${cardId}/exercises/${exerciseId}`, data),
  deleteExercise: (cardId, exerciseId) => api.delete(`/api/gym/cards/${cardId}/exercises/${exerciseId}`),
};

// Notifications APIs
export const notificationsAPI = {
  getNotifications: (params) => api.get('/api/notifications/', { params }),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id, isRead) => api.put(`/api/notifications/${id}/mark-read`, { is_read: isRead }),
  markAllAsRead: () => api.put('/api/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
};

export default api;
