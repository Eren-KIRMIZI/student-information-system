import * as svc from '../services/user.service.js';
import { successResponse } from '../utils/response.util.js';

export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getMe(req.user.id));
  } catch (e) {
    next(e);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    return successResponse(res, await svc.updateMe(req.user.id, req.body, req.user.role), 'Profil güncellendi');
  } catch (e) {
    next(e);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getUsers(req.query));
  } catch (e) {
    next(e);
  }
};

export const createUser = async (req, res, next) => {
  try {
    return successResponse(res, await svc.createUser(req.body, req.user.id), 'Kullanıcı oluşturuldu', 201);
  } catch (e) {
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    return successResponse(res, await svc.updateUser(req.params.id, req.body), 'Kullanıcı güncellendi');
  } catch (e) {
    next(e);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    return successResponse(
      res,
      await svc.updateUserStatus(req.params.id, req.body.isActive, req.user.id),
      `Kullanıcı ${req.body.isActive ? 'aktif' : 'pasif'} edildi`,
    );
  } catch (e) {
    next(e);
  }
};
