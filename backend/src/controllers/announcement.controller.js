import * as svc from '../services/announcement.service.js';
import { successResponse } from '../utils/response.util.js';

export const getAnnouncements = async (req, res, next) => {
  try { return successResponse(res, await svc.getAnnouncements(req.query, req.user.role)); } catch (e) { next(e); }
};

export const getAnnouncementById = async (req, res, next) => {
  try { return successResponse(res, await svc.getAnnouncementById(req.params.id)); } catch (e) { next(e); }
};

export const createAnnouncement = async (req, res, next) => {
  try { return successResponse(res, await svc.createAnnouncement(req.body, req.user.id), 'Duyuru oluşturuldu', 201); } catch (e) { next(e); }
};

export const updateAnnouncement = async (req, res, next) => {
  try { return successResponse(res, await svc.updateAnnouncement(req.params.id, req.body), 'Duyuru güncellendi'); } catch (e) { next(e); }
};

export const deleteAnnouncement = async (req, res, next) => {
  try { return successResponse(res, await svc.deleteAnnouncement(req.params.id), 'Duyuru silindi'); } catch (e) { next(e); }
};
