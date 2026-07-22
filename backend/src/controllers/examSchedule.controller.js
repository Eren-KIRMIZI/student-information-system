import * as svc from '../services/examSchedule.service.js';
import { successResponse } from '../utils/response.util.js';

export const getMyExamSchedule = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getMyExamSchedule(req.user.id, req.user.role, req.query.examType));
  } catch (e) {
    next(e);
  }
};

export const getSectionExamSchedule = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getSectionExamSchedule(req.params.id));
  } catch (e) {
    next(e);
  }
};

export const createExamSlot = async (req, res, next) => {
  try {
    return successResponse(res, await svc.createExamSlot(req.params.id, req.body), 'Sınav slotu eklendi', 201);
  } catch (e) {
    next(e);
  }
};

export const updateExamSlot = async (req, res, next) => {
  try {
    return successResponse(res, await svc.updateExamSlot(req.params.id, req.body), 'Sınav slotu güncellendi');
  } catch (e) {
    next(e);
  }
};

export const deleteExamSlot = async (req, res, next) => {
  try {
    return successResponse(res, await svc.deleteExamSlot(req.params.id), 'Sınav slotu silindi');
  } catch (e) {
    next(e);
  }
};
