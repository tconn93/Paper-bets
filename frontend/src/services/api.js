import axios from 'axios';




const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: base,
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
  (error) => {
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
  register: async (credentials) => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);

    
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  getBalance: async () => {
    const response = await api.get('/auth/balance');
    return response.data;
  },
};

// Odds endpoints
export const oddsApi = {
  getSports: async () => {
    const response = await api.get('/odds/sports');
    return response.data;
  },

  getBySport: async (sportKey) => {
    const response = await api.get(`/odds/${sportKey}`);
    return response.data;
  },

  getEventOdds: async (sportKey, eventId) => {
    const response = await api.get(`/odds/${sportKey}/events/${eventId}`);
    return response.data;
  },
};

// Bet endpoints
export const betApi = {
  place: async (betData) => {
    const response = await api.post('/bets', betData);
    return response.data;
  },

  getMyBets: async () => {
    const response = await api.get('/bets');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bets/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/bets/stats');
    return response.data;
  },
};

export default api;