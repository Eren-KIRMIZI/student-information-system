import * as svc from '../services/dashboard.service.js';
import { successResponse } from '../utils/response.util.js';

export const getStudentDashboard = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getStudentDashboard(req.user.id));
  } catch (e) {
    next(e);
  }
};

export const getAcademicianDashboard = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getAcademicianDashboard(req.user.id));
  } catch (e) {
    next(e);
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getAdminDashboard());
  } catch (e) {
    next(e);
  }
};
