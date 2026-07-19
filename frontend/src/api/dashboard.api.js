import axiosInstance from './axiosInstance';

export const getDashboardStudent     = () => axiosInstance.get('/dashboard/student').then(r => r.data.data);
export const getDashboardAcademician = () => axiosInstance.get('/dashboard/academician').then(r => r.data.data);
export const getDashboardAdmin       = () => axiosInstance.get('/dashboard/admin').then(r => r.data.data);
