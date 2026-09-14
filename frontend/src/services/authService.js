import { apiRequest } from './api.js';

export async function signup({ name, email, password }) {
  const data = await apiRequest('/auth/signup', { method: 'POST', body: { name, email, password } });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export async function login({ email, password }) {
  const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getStoredUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}
