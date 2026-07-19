import * as svc from '../services/academic.service.js';
import { successResponse } from '../utils/response.util.js';

export const listCourseSections = async (req, res, next) => {
  try { return successResponse(res, await svc.listCourseSections(req.query)); } catch (e) { next(e); }
};
export const getCourseSectionById = async (req, res, next) => {
  try { return successResponse(res, await svc.getCourseSectionById(req.params.id)); } catch (e) { next(e); }
};
export const createCourseSection = async (req, res, next) => {
  try { return successResponse(res, await svc.createCourseSection(req.body), 'Ders şubesi oluşturuldu', 201); } catch (e) { next(e); }
};
export const updateCourseSection = async (req, res, next) => {
  try { return successResponse(res, await svc.updateCourseSection(req.params.id, req.body), 'Ders şubesi güncellendi'); } catch (e) { next(e); }
};
export const archiveCourseSection = async (req, res, next) => {
  try { return successResponse(res, await svc.archiveCourseSection(req.params.id), 'Ders şubesi arşivlendi'); } catch (e) { next(e); }
};
export const deleteCourseSection = async (req, res, next) => {
  try { await svc.deleteCourseSection(req.params.id); return successResponse(res, null, 'Ders şubesi silindi'); } catch (e) { next(e); }
};
