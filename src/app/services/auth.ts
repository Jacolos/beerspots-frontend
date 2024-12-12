import { create } from 'zustand';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

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

const isClient = typeof window !== 'undefined';

export const register = async (data: RegisterData): Promise<LoginResponse> => {
  try {
    const response = await fetch('https://piwo.jacolos.pl/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (response.status === 422) {
        // Błędy walidacji
        const errorMessages = Object.values(responseData.errors).flat();
        throw new Error(errorMessages[0] as string);
      }
      throw new Error(responseData.message || 'Błąd rejestracji');
    }

    if (isClient) {
      localStorage.setItem('authToken', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
    }
    return responseData;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch('https://piwo.jacolos.pl/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 422) {
        // Błędy walidacji
        const errorMessages = Object.values(data.errors).flat();
        throw new Error(errorMessages[0] as string);
      }
      throw new Error(data.message || 'Nieprawidłowy email lub hasło');
    }

    if (isClient) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const token = getAuthToken();
    if (token) {
      const response = await fetch('https://piwo.jacolos.pl/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Błąd podczas wylogowywania');
      }
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    if (isClient) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }
};

export const getAuthToken = (): string | null => {
  if (!isClient) return null;
  return localStorage.getItem('authToken');
};

export const getUser = (): AuthUser | null => {
  if (!isClient) return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const useAuth = create<AuthState>((set) => ({
  token: getAuthToken(),
  user: getUser(),
  isAuthenticated: !!getAuthToken(),
  login: async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      set({
        token: response.token,
        user: response.user,
        isAuthenticated: true
      });
    } catch (error) {
      throw error;
    }
  },
  logout: async () => {
    await logout();
    set({
      token: null,
      user: null,
      isAuthenticated: false
    });
  }
}));