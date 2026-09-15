import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  signup: async (userData) => {
    const res = await api.post('/auth/signup', userData);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : { id: 1, name: 'Sohan', email: 'sohan@example.com' };
    } catch {
      return { id: 1, name: 'Sohan', email: 'sohan@example.com' };
    }
  },
};

export const groupsAPI = {
  list: async () => {
    try {
      const res = await api.get('/groups');
      return res.data;
    } catch (err) {
      console.warn('API fetch groups warning:', err.message);
      return null;
    }
  },
  getDetails: async (id) => {
    const res = await api.get(`/groups/${id}`);
    return res.data;
  },
  create: async (groupData) => {
    const res = await api.post('/groups', groupData);
    return res.data;
  },
  addMember: async (groupId, email) => {
    const res = await api.post(`/groups/${groupId}/members`, { email });
    return res.data;
  },
};

export const expensesAPI = {
  create: async (groupId, expenseData) => {
    const res = await api.post(`/groups/${groupId}/expenses`, expenseData);
    return res.data;
  },
};

export default api;
