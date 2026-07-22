import api from './axiosInstance';

export const getSectionMaterials = async (sectionId) => {
  const response = await api.get(`/materials/section/${sectionId}`);
  return response.data;
};

export const uploadMaterial = async (data) => {
  // data is FormData
  const response = await api.post('/materials', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const downloadMaterial = async (id) => {
  const response = await api.get(`/materials/${id}/download`);
  return response.data;
};

export const deleteMaterial = async (id) => {
  const response = await api.delete(`/materials/${id}`);
  return response.data;
};
