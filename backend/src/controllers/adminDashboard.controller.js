import * as svc from '../services/adminDashboard.service.js';
import { successResponse } from '../utils/response.util.js';

export const getAdminKPIs = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getAdminKPIs());
  } catch (e) {
    next(e);
  }
};
