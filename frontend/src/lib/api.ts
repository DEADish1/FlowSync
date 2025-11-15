import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Mood API
export const moodAPI = {
  analyze: (text: string) => api.post('/mood/analyze', { text }),
  log: (energyLevel: string, moodCategory?: string, context?: string) =>
    api.post('/mood/log', { energyLevel, moodCategory, context }),
  getHistory: (days?: number) => api.get('/mood/history', { params: { days } }),
  getPatterns: () => api.get('/mood/patterns'),
};

// Tasks API
export const tasksAPI = {
  getTasks: (status?: string) => api.get('/tasks', { params: { status } }),
  getTask: (id: number) => api.get(`/tasks/${id}`),
  createTask: (task: any) => api.post('/tasks', task),
  updateTask: (id: number, updates: any) => api.put(`/tasks/${id}`, updates),
  deleteTask: (id: number) => api.delete(`/tasks/${id}`),
  prioritize: (energyLevel: string) => api.post('/tasks/prioritize', { energyLevel }),
};

// Schedule API
export const scheduleAPI = {
  getSchedule: (start?: string, end?: string) =>
    api.get('/schedule', { params: { start, end } }),
  generateSchedule: () => api.post('/schedule/generate'),
  updateSchedule: (id: number, updates: any) => api.put(`/schedule/${id}`, updates),
  reshuffle: (energyLevel: string) => api.post('/schedule/reshuffle', { energyLevel }),
};

// Music API
export const musicAPI = {
  getRecommendations: (mood: string, energy: string) =>
    api.get('/music/recommendations', { params: { mood, energy } }),
  generateSunoPrompt: (mood: string, energy: string, taskType: string) =>
    api.post('/music/suno-prompt', { mood, energy, taskType }),
  getSpotifyPlaylist: (id: string) => api.get(`/music/spotify-playlist/${id}`),
};

// Flow Blocks API
export const flowBlocksAPI = {
  getFlowBlocks: () => api.get('/flow-blocks'),
  createCustomBlock: (block: any) => api.post('/flow-blocks/custom', block),
  getActiveBlock: () => api.get('/flow-blocks/active'),
};

// Analytics API
export const analyticsAPI = {
  getEnergyMap: (days?: number) => api.get('/analytics/energy-map', { params: { days } }),
  getBestTimes: () => api.get('/analytics/best-times'),
  getProductivityScore: () => api.get('/analytics/productivity-score'),
};

// Coach API
export const coachAPI = {
  getInsights: () => api.get('/coach/insights'),
  getDailyTip: () => api.get('/coach/daily-tip'),
  getDailyBriefing: () => api.get('/coach/briefing'),
  askQuestion: (question: string) => api.post('/coach/ask', { question }),
  breakdownTask: (title: string, description?: string) =>
    api.post('/coach/breakdown', { title, description }),
};
