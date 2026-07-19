import * as svc from '../services/weeklySchedule.service.js';
import { successResponse } from '../utils/response.util.js';

export const getMyWeeklySchedule = async (req, res, next) => {
  try { return successResponse(res, await svc.getMyWeeklySchedule(req.user.id, req.user.role)); } catch (e) { next(e); }
};

export const getSectionWeeklySchedule = async (req, res, next) => {
  try { return successResponse(res, await svc.getSectionWeeklySchedule(req.params.id)); } catch (e) { next(e); }
};

export const createWeeklySlot = async (req, res, next) => {
  try { return successResponse(res, await svc.createWeeklySlot(req.params.id, req.body), 'Slot eklendi', 201); } catch (e) { next(e); }
};

export const updateWeeklySlot = async (req, res, next) => {
  try { return successResponse(res, await svc.updateWeeklySlot(req.params.id, req.body), 'Slot güncellendi'); } catch (e) { next(e); }
};

export const deleteWeeklySlot = async (req, res, next) => {
  try { return successResponse(res, await svc.deleteWeeklySlot(req.params.id), 'Slot silindi'); } catch (e) { next(e); }
};
