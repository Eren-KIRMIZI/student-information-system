import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  updateStudentStatus,
  getLecturers,
  getLecturer,
  createLecturer,
  updateLecturer,
  updateLecturerStatus,
} from '../api/people.api';

// ====== Students ======
export const useStudents = (params) => useQuery({ queryKey: ['students', params], queryFn: () => getStudents(params) });

export const useStudent = (id) => useQuery({ queryKey: ['student', id], queryFn: () => getStudent(id), enabled: !!id });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateStudent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};

export const useUpdateStudentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => updateStudentStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};

// ====== Lecturers ======
export const useLecturers = (params) =>
  useQuery({ queryKey: ['lecturers', params], queryFn: () => getLecturers(params) });

export const useLecturer = (id) =>
  useQuery({ queryKey: ['lecturer', id], queryFn: () => getLecturer(id), enabled: !!id });

export const useCreateLecturer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLecturer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lecturers'] }),
  });
};

export const useUpdateLecturer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateLecturer(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lecturers'] }),
  });
};

export const useUpdateLecturerStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => updateLecturerStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lecturers'] }),
  });
};

// ====== Own Lecturer ID ======
export const useMyLecturerId = () => {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ['lecturers-mine'],
    queryFn: () => getLecturers({ limit: 1 }),
    enabled: !user?.lecturerId,
  });
  return user?.lecturerId ?? data?.data?.[0]?.id ?? null;
};
