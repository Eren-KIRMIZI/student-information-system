import * as svc from '../services/studentAnalytics.service.js';
import { successResponse } from '../utils/response.util.js';

export const getMyAnalytics = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getMyAnalytics(req.user.id));
  } catch (e) {
    next(e);
  }
};
