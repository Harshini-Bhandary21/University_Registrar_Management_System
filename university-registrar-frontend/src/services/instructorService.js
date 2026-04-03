import api from './api';

export const instructorService = {
    getAll: () => api.get('/instructors'),
    getById: (id) => api.get(`/instructors/${id}`),
    create: (data) => api.post('/instructors', data),
    update: (id, data) => api.put(`/instructors/${id}`, data),
    delete: (id) => api.delete(`/instructors/${id}`),
    getByDepartment: (deptId) => api.get(`/instructors/department/${deptId}`),
    search: (query) => api.get(`/instructors/search?q=${query}`),
};