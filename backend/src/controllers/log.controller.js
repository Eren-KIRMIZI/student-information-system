import * as svc from '../services/log.service.js';
import { successResponse } from '../utils/response.util.js';

export const getLogs = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getLogs(req.query));
  } catch (e) {
    next(e);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getAuditLogs(req.query));
  } catch (e) {
    next(e);
  }
};
