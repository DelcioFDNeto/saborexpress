import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE_URL = rawApiUrl.replace(/\/$/, '');

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    Accept: 'application/json',
  },
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
  delete axios.defaults.headers.common.Authorization;
}

export function getStoredToken() {
  return localStorage.getItem('@SaborExpress:token');
}
