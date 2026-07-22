import * as materialService from '../services/material.service.js';
import { successResponse } from '../utils/response.util.js';

export const createMaterial = async (req, res, next) => {
  try {
    const file = req.file;
    const material = await materialService.createMaterial(file, req.body, req.user);
    return successResponse(res, material, 'Materyal başarıyla yüklendi', 201);
  } catch (e) {
    next(e);
  }
};

export const getSectionMaterials = async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const materials = await materialService.getSectionMaterials(sectionId, req.user);
    return successResponse(res, materials, 'Materyaller getirildi', 200);
  } catch (e) {
    next(e);
  }
};

export const downloadMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await materialService.incrementDownload(id, req.user);
    return successResponse(res, material, 'İndirme kaydedildi', 200);
  } catch (e) {
    next(e);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    await materialService.deleteMaterial(id, req.user);
    return successResponse(res, null, 'Materyal başarıyla silindi', 200);
  } catch (e) {
    next(e);
  }
};
