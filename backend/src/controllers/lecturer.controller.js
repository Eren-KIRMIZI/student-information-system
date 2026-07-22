import * as svc from '../services/people.service.js';
import { successResponse } from '../utils/response.util.js';

export const listLecturers = async (req, res, next) => {
  try {
    return successResponse(res, await svc.listLecturers(req.query));
  } catch (e) {
    next(e);
  }
};
export const getLecturerById = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getLecturerById(req.params.id));
  } catch (e) {
    next(e);
  }
};
export const createLecturer = async (req, res, next) => {
  try {
    return successResponse(res, await svc.createLecturer(req.body), 'Akademisyen oluşturuldu', 201);
  } catch (e) {
    next(e);
  }
};
export const updateLecturer = async (req, res, next) => {
  try {
    return successResponse(res, await svc.updateLecturer(req.params.id, req.body, req.user), 'Akademisyen güncellendi');
  } catch (e) {
    next(e);
  }
};
export const updateLecturerStatus = async (req, res, next) => {
  try {
    await svc.updateLecturerStatus(req.params.id, req.body.isActive);
    return successResponse(res, null, `Akademisyen ${req.body.isActive ? 'aktif' : 'pasif'} edildi`);
  } catch (e) {
    next(e);
  }
};
