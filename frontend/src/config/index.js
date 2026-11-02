/**
 * config/index.js
 * Central app configuration: API url, tokens and shared option lists.
 * (Option lists mirror backend/model/Employee.js enums)
 */

export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const TOKEN_KEY = 'wizinoa_admin_token';

export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
  'Customer Support',
  'IT',
];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
];

export const EMPLOYEE_STATUSES = [
  { value: 'active', label: 'Active', badge: 'success' },
  { value: 'on-leave', label: 'On Leave', badge: 'warning' },
  { value: 'inactive', label: 'Inactive', badge: 'secondary' },
];

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2 MB
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const STATUS_BADGE = Object.fromEntries(EMPLOYEE_STATUSES.map((s) => [s.value, s.badge]));
export const STATUS_LABEL = Object.fromEntries(EMPLOYEE_STATUSES.map((s) => [s.value, s.label]));
