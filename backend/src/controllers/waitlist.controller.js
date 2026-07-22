import * as svc from '../services/waitlist.service.js';
import { successResponse } from '../utils/response.util.js';

export const joinWaitlist = async (req, res, next) => {
  try {
    return successResponse(
      res,
      await svc.joinWaitlist(req.user.id, req.body.courseSectionId),
      'Bekleme listesine eklendiniz',
      201,
    );
  } catch (e) {
    next(e);
  }
};

export const cancelWaitlist = async (req, res, next) => {
  try {
    return successResponse(
      res,
      await svc.cancelWaitlist(req.user.id, req.params.courseSectionId),
      'Bekleme listesinden çıkarıldınız',
    );
  } catch (e) {
    next(e);
  }
};

export const getMyWaitlist = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getMyWaitlist(req.user.id));
  } catch (e) {
    next(e);
  }
};

export const getWaitlistForSection = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getWaitlistForSection(req.params.courseSectionId));
  } catch (e) {
    next(e);
  }
};

export const promoteFromWaitlist = async (req, res, next) => {
  try {
    return successResponse(res, await svc.promoteFromWaitlist(req.params.id), 'Öğrenci derse kaydedildi');
  } catch (e) {
    next(e);
  }
};
