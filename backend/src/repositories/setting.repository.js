import prisma from '../config/prisma.js';
import { cache } from '../utils/cache.js';

const TTL = 3600;

export const settingRepository = {
  findAll: async () => {
    return cache.getOrSet('settings:all', TTL, async () => {
      return prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
    });
  },

  findByKey: async (key) => {
    return cache.getOrSet(`settings:${key}`, TTL, async () => {
      return prisma.systemSetting.findUnique({ where: { key } });
    });
  },

  findByCategory: async (category) => {
    return cache.getOrSet(`settings:cat:${category}`, TTL, async () => {
      return prisma.systemSetting.findMany({ where: { category }, orderBy: { key: 'asc' } });
    });
  },

  upsert: async (key, value, category = 'general') => {
    const result = await prisma.systemSetting.upsert({
      where: { key },
      update: { value, category },
      create: { key, value, category },
    });
    await cache.invalidatePattern('settings:*');
    return result;
  },

  delete: async (key) => {
    await prisma.systemSetting.delete({ where: { key } });
    await cache.invalidatePattern('settings:*');
  },

  getValue: async (key, defaultValue = null) => {
    const setting = await settingRepository.findByKey(key);
    return setting ? setting.value : defaultValue;
  },
};
