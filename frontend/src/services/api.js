import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor injecting JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zencity_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor handling 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (localStorage.getItem('zencity_token')) {
        localStorage.removeItem('zencity_token');
        localStorage.removeItem('zencity_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
};

export const complaintsApi = {
  create: (formData) => api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, payload) => api.patch(`/complaints/${id}/status`, payload),
  assign: (id, payload) => api.patch(`/complaints/${id}/assign`, payload),
};

export const feedbackApi = {
  create: (payload) => api.post('/feedback', payload),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (payload) => api.post('/categories', payload),
};

export const departmentsApi = {
  list: () => api.get('/departments'),
};

export const wardsApi = {
  list: () => api.get('/wards'),
};

export const usersApi = {
  list: (params) => api.get('/users', { params }),
  listOfficers: (params) => api.get('/users/officers', { params }),
  updateStatus: (id, payload) => api.patch(`/users/${id}`, payload),
};

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(id ? `/notifications/${id}/read` : '/notifications/read'),
};

export const mapApi = {
  getComplaints: (params) => api.get('/map/complaints', { params }),
};

export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
  getFull: () => api.get('/analytics/full'),
  getDbViews: () => api.get('/analytics/db-views'),
  refresh: () => api.post('/analytics/refresh'),
  getChartUrl: (chartName) => `/api/analytics/charts/${chartName}`,
};

export default api;
