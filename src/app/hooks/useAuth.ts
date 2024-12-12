// src/app/hooks/useAuth.ts
import { create } from 'zustand';
import { getAuthToken, getUser, login as loginApi, logout as logoutApi } from '../services/auth';

interface AuthUser {
    id: number;
    email: string;
    name: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: getAuthToken(),
  user: getUser(),
  isAuthenticated: !!getAuthToken(),
  login: async (email: string, password: string) => {
    try {
      const response = await loginApi(email, password);
      set({
        token: response.token,
        user: response.user,
        isAuthenticated: true
      });
    } catch (error) {
      throw error;
    }
  },
  logout: () => {
    logoutApi();
    set({
      token: null,
      user: null,
      isAuthenticated: false
    });
  }
}));