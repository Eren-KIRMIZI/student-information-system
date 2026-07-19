import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyEnrollments, getEnrollments, createEnrollment,
  approveEnrollment, rejectEnrollment, dropEnrollment,
  getMyGrades, getMyTranscript, getSectionGrades,
  updateGrade, finalizeGrade,
  getSectionAttendance, createAttendance, getMyAttendance,
} from '../api/records.api';

// ====== Enrollments ======
export const useMyEnrollments = (params) =>
  useQuery({ queryKey: ['enrollments', 'me', params], queryFn: () => getMyEnrollments(params) });

export const useEnrollments = (params) =>
  useQuery({ queryKey: ['enrollments', params], queryFn: () => getEnrollments(params) });

export const useCreateEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEnrollment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['course-sections'] });
    },
  });
};

export const useApproveEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveEnrollment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enrollments'] }),
  });
};

export const useRejectEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectEnrollment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enrollments'] }),
  });
};

export const useDropEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: dropEnrollment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enrollments'] }),
  });
};

// ====== Grades ======
export const useMyGrades = (params) =>
  useQuery({ queryKey: ['grades', 'me', params], queryFn: () => getMyGrades(params) });

export const useMyTranscript = () =>
  useQuery({ queryKey: ['transcript', 'me'], queryFn: getMyTranscript });

export const useSectionGrades = (sectionId) =>
  useQuery({
    queryKey: ['section-grades', sectionId],
    queryFn: () => getSectionGrades(sectionId),
    enabled: !!sectionId,
  });

export const useUpdateGrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, data }) => updateGrade(enrollmentId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['section-grades'] }),
  });
};

export const useFinalizeGrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: finalizeGrade,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['section-grades'] }),
  });
};

// ====== Attendance ======
export const useSectionAttendance = (sectionId, params) =>
  useQuery({
    queryKey: ['section-attendance', sectionId, params],
    queryFn: () => getSectionAttendance(sectionId, params),
    enabled: !!sectionId,
  });

export const useCreateAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }) => createAttendance(sectionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['section-attendance'] }),
  });
};

export const useMyAttendance = () =>
  useQuery({ queryKey: ['my-attendance'], queryFn: getMyAttendance });
