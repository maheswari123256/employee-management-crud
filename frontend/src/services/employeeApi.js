/**
 * services/employeeApi.js
 * Single API module: axios instance (JWT interceptors) + auth + employee CRUD.
 */
import axios from 'axios';
import { API_URL, TOKEN_KEY } from '../config';

const api = axios.create({ baseURL: API_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

const clean = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null));

/* ------------------------------------ Auth ----------------------------------- */
export const login = (email, password) => api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');

/* --------------------------------- Employees --------------------------------- */
export const getEmployees = (params = {}) => api.get('/employees', { params: clean(params) });
export const getEmployeeStats = () => api.get('/employees/stats');
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const createEmployee = (formData) => api.post('/employees', formData);
export const updateEmployee = (id, formData) => api.put(`/employees/${id}`, formData);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

export default {
  login,
  getMe,
  getEmployees,
  getEmployeeStats,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
