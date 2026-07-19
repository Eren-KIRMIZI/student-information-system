import { useQuery } from '@tanstack/react-query';
import { getDashboardStudent, getDashboardAcademician, getDashboardAdmin } from '../api/dashboard.api';

export const useDashboardStudent = () =>
  useQuery({ queryKey: ['dashboard', 'student'], queryFn: getDashboardStudent });

export const useDashboardAcademician = () =>
  useQuery({ queryKey: ['dashboard', 'academician'], queryFn: getDashboardAcademician });

export const useDashboardAdmin = () =>
  useQuery({ queryKey: ['dashboard', 'admin'], queryFn: getDashboardAdmin });
