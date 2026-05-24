import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../api/auth.api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

// ─── Eagerly read cached user from localStorage ───────────────────────────────
// This eliminates the blank-screen flash caused by waiting for fetchMe() to
// resolve before rendering. If the cached data is available, the dashboard
// renders immediately on first paint; fetchMe() then refreshes it in the background.
function getCachedUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const cachedToken = localStorage.getItem('token');
const cachedUser = getCachedUser();

export const useAuthStore = create<AuthState>((set) => ({
  // If we already have both a token AND a cached user, skip the loading state
  // entirely so the dashboard renders immediately.
  user: cachedToken ? cachedUser : null,
  token: cachedToken,
  loading: cachedToken && !cachedUser ? true : false,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    // Cache user object so next page load skips fetchMe() waterfall
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const res = await authApi.getMe();
      // Update cache with fresh data
      localStorage.setItem('user', JSON.stringify(res.data));
      set({ user: res.data, loading: false });
    } catch {
      localStorage.removeItem('user');
      set({ user: null, loading: false });
    }
  },
}));
