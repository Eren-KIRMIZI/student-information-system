import * as svc from '../services/upload.service.js';
import { successResponse } from '../utils/response.util.js';

export const createUpload = async (req, res, next) => {
  try {
    const { purpose, courseSectionId } = req.body;
    return successResponse(
      res,
      await svc.createUpload(req.file, req.user.id, purpose, courseSectionId),
      'Dosya yüklendi',
      201,
    );
  } catch (e) {
    next(e);
  }
};

export const updateProfilePhoto = async (req, res, next) => {
  try {
    return successResponse(
      res,
      await svc.updateProfilePhoto(req.file, req.user.id, req.user.role),
      'Profil fotoğrafı güncellendi',
    );
  } catch (e) {
    next(e);
  }
};

export const deleteUpload = async (req, res, next) => {
  try {
    return successResponse(res, await svc.deleteUpload(req.params.id, req.user.id, req.user.role), 'Dosya silindi');
  } catch (e) {
    next(e);
  }
};
