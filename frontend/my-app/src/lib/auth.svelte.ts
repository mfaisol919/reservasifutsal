import { goto } from '$app/navigation';

export interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

export const BACKEND_URL = 'http://localhost:5000';

class AuthState {
  user = $state<User | null>(null);
  token = $state<string | null>(null);
  loading = $state<boolean>(true);

  init() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('futsal_token');
      const savedUser = localStorage.getItem('futsal_user');
      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser);
        } catch (e) {
          this.clearSession();
        }
      }
      this.loading = false;
    }
  }

  setSession(token: string, user: User) {
    this.token = token;
    this.user = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('futsal_token', token);
      localStorage.setItem('futsal_user', JSON.stringify(user));
    }
  }

  clearSession() {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('futsal_token');
      localStorage.removeItem('futsal_user');
    }
  }
}

export const auth = new AuthState();

// Authenticated fetch wrapper
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('futsal_token') : null;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    auth.clearSession();
    if (typeof window !== 'undefined') {
      goto('/login');
    }
  }

  return response;
}
