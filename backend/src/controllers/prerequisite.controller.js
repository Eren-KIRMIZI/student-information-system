import * as svc from '../services/prerequisite.service.js';
import { successResponse } from '../utils/response.util.js';

export const listPrerequisites = async (req, res, next) => {
  try { return successResponse(res, await svc.listPrerequisites()); } catch (e) { next(e); }
};

export const getPrerequisitesForCourse = async (req, res, next) => {
  try { return successResponse(res, await svc.getPrerequisitesForCourse(req.params.courseId)); } catch (e) { next(e); }
};

export const checkMyPrerequisites = async (req, res, next) => {
  try { return successResponse(res, await svc.checkMyPrerequisites(req.user.id, req.params.courseId)); } catch (e) { next(e); }
};

export const createPrerequisite = async (req, res, next) => {
  try { return successResponse(res, await svc.createPrerequisite(req.body), 'Ön koşul eklendi', 201); } catch (e) { next(e); }
};

export const deletePrerequisite = async (req, res, next) => {
  try { return successResponse(res, await svc.deletePrerequisite(req.params.id), 'Ön koşul silindi'); } catch (e) { next(e); }
};
