import * as svc from '../services/people.service.js';
import { successResponse } from '../utils/response.util.js';

export const listStudents = async (req, res, next) => {
  try {
    return successResponse(res, await svc.listStudents(req.query));
  } catch (e) {
    next(e);
  }
};
export const getStudentById = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getStudentById(req.params.id));
  } catch (e) {
    next(e);
  }
};
export const createStudent = async (req, res, next) => {
  try {
    return successResponse(res, await svc.createStudent(req.body), 'Öğrenci oluşturuldu', 201);
  } catch (e) {
    next(e);
  }
};
export const updateStudent = async (req, res, next) => {
  try {
    return successResponse(res, await svc.updateStudent(req.params.id, req.body, req.user), 'Öğrenci güncellendi');
  } catch (e) {
    next(e);
  }
};
export const updateStudentStatus = async (req, res, next) => {
  try {
    await svc.updateStudentStatus(req.params.id, req.body.isActive);
    return successResponse(res, null, `Öğrenci ${req.body.isActive ? 'aktif' : 'pasif'} edildi`);
  } catch (e) {
    next(e);
  }
};
