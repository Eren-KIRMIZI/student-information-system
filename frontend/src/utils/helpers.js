import { GRADE_COLORS } from './constants';

export const getRoleName = (role) => {
  if (!role) return null;
  if (typeof role === 'object') return role.name;
  return role;
};

export const formatFullName = (firstName, lastName) => `${firstName ?? ''} ${lastName ?? ''}`.trim();

export const formatLecturerName = (lecturer) => {
  if (!lecturer) return '—';
  return `${lecturer.title ?? ''} ${lecturer.firstName} ${lecturer.lastName}`.trim();
};

export const getGradeColor = (letter) => GRADE_COLORS[letter] || '#94a3b8';

export const getPercentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const truncate = (str, max = 100) => {
  if (!str || str.length <= max) return str;
  return str.slice(0, max) + '...';
};
