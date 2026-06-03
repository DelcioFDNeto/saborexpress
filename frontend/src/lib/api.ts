import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
export const AUTH_TOKEN_COOKIE = 'SaborExpressAuthToken';
export const AUTH_USER_COOKIE = 'SaborExpressAuthUser';
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const AUTH_COOKIE_PATH = '/';
const AUTH_COOKIE_SAME_SITE = 'Lax';

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

function cookieSecurityAttribute() {
  return window.location.protocol === 'https:' ? '; Secure' : '';
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}; Path=${AUTH_COOKIE_PATH}; SameSite=${AUTH_COOKIE_SAME_SITE}${cookieSecurityAttribute()}`;
}

function getCookie(name: string) {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=${AUTH_COOKIE_PATH}; SameSite=${AUTH_COOKIE_SAME_SITE}${cookieSecurityAttribute()}`;
}

export function storeAuthSession(token: string, user: unknown) {
  setCookie(AUTH_TOKEN_COOKIE, token);
  setCookie(AUTH_USER_COOKIE, JSON.stringify(user));
}

export function getStoredUser() {
  return getCookie(AUTH_USER_COOKIE);
}

export function getStoredToken() {
  return getCookie(AUTH_TOKEN_COOKIE);
}

export function clearStoredAuthSession() {
  deleteCookie(AUTH_TOKEN_COOKIE);
  deleteCookie(AUTH_USER_COOKIE);
}
