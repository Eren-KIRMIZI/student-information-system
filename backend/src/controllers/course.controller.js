import * as svc from '../services/academic.service.js';
import { successResponse } from '../utils/response.util.js';

export const listCourses = async (req, res, next) => {
  try { return successResponse(res, await svc.listCourses(req.query)); } catch (e) { next(e); }
};
export const getCourseById = async (req, res, next) => {
  try { return successResponse(res, await svc.getCourseById(req.params.id)); } catch (e) { next(e); }
};
export const createCourse = async (req, res, next) => {
  try { return successResponse(res, await svc.createCourse(req.body), 'Ders oluşturuldu', 201); } catch (e) { next(e); }
};
export const updateCourse = async (req, res, next) => {
  try { return successResponse(res, await svc.updateCourse(req.params.id, req.body), 'Ders güncellendi'); } catch (e) { next(e); }
};
export const deleteCourse = async (req, res, next) => {
  try { await svc.deleteCourse(req.params.id); return successResponse(res, null, 'Ders silindi'); } catch (e) { next(e); }
};
