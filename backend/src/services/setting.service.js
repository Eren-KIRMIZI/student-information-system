import { settingRepository } from '../repositories/setting.repository.js';

export const settingService = {
  getAll: () => settingRepository.findAll(),
  getByKey: (key) => settingRepository.findByKey(key),
  getByCategory: (category) => settingRepository.findByCategory(category),
  upsert: (key, value, category) => settingRepository.upsert(key, value, category),
  delete: (key) => settingRepository.delete(key),
  getValue: (key, defaultValue) => settingRepository.getValue(key, defaultValue),
};
