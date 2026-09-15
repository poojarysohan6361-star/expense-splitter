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

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const path = window.location.pathname;
    const isAuthPage = path.startsWith('/login') || path.startsWith('/signup');
    if (status === 401 && !isAuthPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

const parseStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user || !user.id) return null;
    return user;
  } catch {
    return null;
  }
};

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
  getToken: () => localStorage.getItem('token'),
  getCurrentUser: () => parseStoredUser(),
};

export const groupsAPI = {
  list: async () => {
    const res = await api.get('/groups');
    return res.data;
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
  getBalances: async (id) => {
    const res = await api.get(`/groups/${id}/balances`);
    return res.data;
  },
};

export const expensesAPI = {
  list: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/expenses`);
    return res.data;
  },
  create: async (groupId, expenseData) => {
    const res = await api.post(`/groups/${groupId}/expenses`, expenseData);
    return res.data;
  },
};

export default api;
