import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFaculties,
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseSections,
  getCourseSection,
  createCourseSection,
  updateCourseSection,
  archiveCourseSection,
  deleteCourseSection,
} from '../api/academic.api';

// ====== Faculties ======
export const useFaculties = (params) =>
  useQuery({ queryKey: ['faculties', params], queryFn: () => getFaculties(params) });

export const useAllFaculties = () =>
  useQuery({ queryKey: ['faculties-all'], queryFn: () => getFaculties({ limit: 100 }) });

export const useFaculty = (id) => useQuery({ queryKey: ['faculty', id], queryFn: () => getFaculty(id), enabled: !!id });

export const useCreateFaculty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFaculty,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculties'] }),
  });
};

export const useUpdateFaculty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateFaculty(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculties'] }),
  });
};

export const useDeleteFaculty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFaculty,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculties'] }),
  });
};

// ====== Departments ======
export const useDepartments = (params) =>
  useQuery({ queryKey: ['departments', params], queryFn: () => getDepartments(params) });

export const useAllDepartments = () =>
  useQuery({ queryKey: ['departments-all'], queryFn: () => getDepartments({ limit: 200 }) });

export const useDepartment = (id) =>
  useQuery({ queryKey: ['department', id], queryFn: () => getDepartment(id), enabled: !!id });

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
};

export const useUpdateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateDepartment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
};

export const useDeleteDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
};

// ====== Courses ======
export const useCourses = (params) => useQuery({ queryKey: ['courses', params], queryFn: () => getCourses(params) });

export const useAllCourses = () => useQuery({ queryKey: ['courses-all'], queryFn: () => getCourses({ limit: 500 }) });

export const useCourse = (id) => useQuery({ queryKey: ['course', id], queryFn: () => getCourse(id), enabled: !!id });

export const useCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
};

export const useUpdateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCourse(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
};

// ====== Course Sections ======
export const useCourseSections = (params) =>
  useQuery({ queryKey: ['course-sections', params], queryFn: () => getCourseSections(params) });

export const useCourseSection = (id) =>
  useQuery({ queryKey: ['course-section', id], queryFn: () => getCourseSection(id), enabled: !!id });

export const useCreateCourseSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCourseSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-sections'] }),
  });
};

export const useUpdateCourseSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCourseSection(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-sections'] }),
  });
};

export const useArchiveCourseSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveCourseSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-sections'] }),
  });
};

export const useDeleteCourseSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCourseSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-sections'] }),
  });
};
