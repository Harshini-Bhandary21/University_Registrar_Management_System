import api from './api';

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};