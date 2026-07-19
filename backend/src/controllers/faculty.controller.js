import * as svc from '../services/academic.service.js';
import { successResponse } from '../utils/response.util.js';

export const listFaculties = async (req, res, next) => {
  try { return successResponse(res, await svc.listFaculties(req.query)); } catch (e) { next(e); }
};
export const getFacultyById = async (req, res, next) => {
  try { return successResponse(res, await svc.getFacultyById(req.params.id)); } catch (e) { next(e); }
};
export const createFaculty = async (req, res, next) => {
  try { return successResponse(res, await svc.createFaculty(req.body), 'Fakülte oluşturuldu', 201); } catch (e) { next(e); }
};
export const updateFaculty = async (req, res, next) => {
  try { return successResponse(res, await svc.updateFaculty(req.params.id, req.body), 'Fakülte güncellendi'); } catch (e) { next(e); }
};
export const deleteFaculty = async (req, res, next) => {
  try { await svc.deleteFaculty(req.params.id); return successResponse(res, null, 'Fakülte silindi'); } catch (e) { next(e); }
};
