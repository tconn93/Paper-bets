import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  Odd,
  Bet,
  UserStats,
  ApiError,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },
};

// Odds endpoints
export const oddsApi = {
  getAll: async (): Promise<Odd[]> => {
    const response = await api.get<Odd[]>('/odds');
    return response.data;
  },

  getBySport: async (sport: string): Promise<Odd[]> => {
    const response = await api.get<Odd[]>(`/odds/sport/${sport}`);
    return response.data;
  },

  getById: async (id: string): Promise<Odd> => {
    const response = await api.get<Odd>(`/odds/${id}`);
    return response.data;
  },
};

// Bet endpoints
export const betApi = {
  place: async (betData: {
    oddId: string;
    selectedOutcome: 'home' | 'away' | 'draw';
    stake: number;
  }): Promise<Bet> => {
    const response = await api.post<Bet>('/bets', betData);
    return response.data;
  },

  getMyBets: async (): Promise<Bet[]> => {
    const response = await api.get<Bet[]>('/bets/my-bets');
    return response.data;
  },

  getById: async (id: string): Promise<Bet> => {
    const response = await api.get<Bet>(`/bets/${id}`);
    return response.data;
  },

  getStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStats>('/bets/stats');
    return response.data;
  },
};

export default api;
