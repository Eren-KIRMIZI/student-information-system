import * as svc from '../services/advisorAnalytics.service.js';
import { successResponse } from '../utils/response.util.js';

export const getAdvisorStudents = async (req, res, next) => {
  try { return successResponse(res, await svc.getAdvisorStudents(req.user.id)); } catch (e) { next(e); }
};

export const getAdvisorStudentDetail = async (req, res, next) => {
  try { return successResponse(res, await svc.getAdvisorStudentDetail(req.user.id, req.params.studentId)); } catch (e) { next(e); }
};
