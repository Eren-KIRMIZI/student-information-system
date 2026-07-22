import * as svc from '../services/attendance.service.js';
import { successResponse } from '../utils/response.util.js';

export const getMyAttendance = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getMyAttendance(req.user.id));
  } catch (e) {
    next(e);
  }
};

export const getSectionAttendance = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getSectionAttendance(req.params.id, req.query.date));
  } catch (e) {
    next(e);
  }
};

export const recordAttendance = async (req, res, next) => {
  try {
    return successResponse(
      res,
      await svc.recordAttendance(req.params.id, req.body, req.user),
      'Yoklama kaydedildi',
      201,
    );
  } catch (e) {
    next(e);
  }
};
