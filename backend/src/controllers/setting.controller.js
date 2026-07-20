import { settingService } from '../services/setting.service.js';
import { successResponse } from '../utils/response.util.js';
import { AppError } from '../utils/appError.util.js';

export const settingController = {
  getAll: async (req, res, next) => {
    try {
      const settings = await settingService.getAll();
      successResponse(res, settings, 200);
    } catch (err) {
      next(err);
    }
  },

  getByKey: async (req, res, next) => {
    try {
      const { key } = req.params;
      const setting = await settingService.getByKey(key);
      if (!setting) return next(new AppError('Ayar bulunamadi', 404));
      successResponse(res, setting, 200);
    } catch (err) {
      next(err);
    }
  },

  getByCategory: async (req, res, next) => {
    try {
      const { category } = req.params;
      const settings = await settingService.getByCategory(category);
      successResponse(res, settings, 200);
    } catch (err) {
      next(err);
    }
  },

  upsert: async (req, res, next) => {
    try {
      const { key } = req.params;
      const { value, category } = req.body;
      const setting = await settingService.upsert(key, value, category);
      successResponse(res, setting, 201);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { key } = req.params;
      await settingService.delete(key);
      successResponse(res, null, 204);
    } catch (err) {
      next(err);
    }
  },
};
