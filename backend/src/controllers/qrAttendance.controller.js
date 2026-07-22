import * as svc from '../services/qrAttendance.service.js';
import { successResponse } from '../utils/response.util.js';

export const generateQRToken = async (req, res, next) => {
  try {
    return successResponse(
      res,
      await svc.generateQRToken(req.user.id, req.body.courseSectionId),
      'QR kodu oluşturuldu',
      201,
    );
  } catch (e) {
    next(e);
  }
};

export const getQRToken = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getQRToken(req.user.id, req.params.courseSectionId));
  } catch (e) {
    next(e);
  }
};

export const scanQRToken = async (req, res, next) => {
  try {
    return successResponse(res, await svc.scanQRToken(req.user.id, req.body.token), 'Yoklama alındı');
  } catch (e) {
    next(e);
  }
};

export const deactivateQRToken = async (req, res, next) => {
  try {
    return successResponse(
      res,
      await svc.deactivateQRToken(req.user.id, req.params.id),
      'QR kodu devre dışı bırakıldı',
    );
  } catch (e) {
    next(e);
  }
};

export const getSectionScans = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getSectionScans(req.params.courseSectionId));
  } catch (e) {
    next(e);
  }
};

export const getRecentScans = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getRecentScans(req.params.courseSectionId));
  } catch (e) {
    next(e);
  }
};
