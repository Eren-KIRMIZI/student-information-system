import * as svc from '../services/academicCalendar.service.js';
import { successResponse } from '../utils/response.util.js';

export const getCalendarEvents = async (req, res, next) => {
  try { return successResponse(res, await svc.getCalendarEvents(req.query)); } catch (e) { next(e); }
};

export const getCalendarEventById = async (req, res, next) => {
  try { return successResponse(res, await svc.getCalendarEventById(req.params.id)); } catch (e) { next(e); }
};

export const createCalendarEvent = async (req, res, next) => {
  try { return successResponse(res, await svc.createCalendarEvent(req.body), 'Etkinlik oluşturuldu', 201); } catch (e) { next(e); }
};

export const updateCalendarEvent = async (req, res, next) => {
  try { return successResponse(res, await svc.updateCalendarEvent(req.params.id, req.body), 'Etkinlik güncellendi'); } catch (e) { next(e); }
};

export const deleteCalendarEvent = async (req, res, next) => {
  try { return successResponse(res, await svc.deleteCalendarEvent(req.params.id), 'Etkinlik silindi'); } catch (e) { next(e); }
};
