import * as svc from '../services/role.service.js';
import { successResponse } from '../utils/response.util.js';

export const getRoles = async (req, res, next) => {
  try { return successResponse(res, await svc.getRoles()); } catch (e) { next(e); }
};

export const updateRole = async (req, res, next) => {
  try { return successResponse(res, await svc.updateRole(req.params.id, req.body), 'Rol güncellendi'); } catch (e) { next(e); }
};
