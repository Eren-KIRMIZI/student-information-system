import * as svc from '../services/academic.service.js';
import { successResponse } from '../utils/response.util.js';

export const listDepartments = async (req, res, next) => {
  try { return successResponse(res, await svc.listDepartments(req.query)); } catch (e) { next(e); }
};
export const getDepartmentById = async (req, res, next) => {
  try { return successResponse(res, await svc.getDepartmentById(req.params.id)); } catch (e) { next(e); }
};
export const createDepartment = async (req, res, next) => {
  try { return successResponse(res, await svc.createDepartment(req.body), 'Bölüm oluşturuldu', 201); } catch (e) { next(e); }
};
export const updateDepartment = async (req, res, next) => {
  try { return successResponse(res, await svc.updateDepartment(req.params.id, req.body), 'Bölüm güncellendi'); } catch (e) { next(e); }
};
export const deleteDepartment = async (req, res, next) => {
  try { await svc.deleteDepartment(req.params.id); return successResponse(res, null, 'Bölüm silindi'); } catch (e) { next(e); }
};
