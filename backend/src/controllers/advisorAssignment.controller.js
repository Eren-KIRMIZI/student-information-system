import * as svc from '../services/advisorAssignment.service.js';
import { successResponse } from '../utils/response.util.js';

export const listAssignments = async (req, res, next) => {
  try {
    return successResponse(res, await svc.listAssignments(req.query));
  } catch (e) {
    next(e);
  }
};

export const getAdvisees = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getAdvisees(req.params.id));
  } catch (e) {
    next(e);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    return successResponse(res, await svc.createAssignment(req.body), 'Danışman ataması yapıldı', 201);
  } catch (e) {
    next(e);
  }
};

export const deactivateAssignment = async (req, res, next) => {
  try {
    return successResponse(res, await svc.deactivateAssignment(req.params.id), 'Atama pasif edildi');
  } catch (e) {
    next(e);
  }
};
