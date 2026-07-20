import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/prisma.js', async () => {
  const { default: mockPrisma } = await import('../../__mocks__/prisma.js');
  return { default: mockPrisma };
});

jest.unstable_mockModule('../../src/utils/cache.js', async () => {
  const { mockCache } = await import('../../__mocks__/cache.js');
  return { cache: mockCache };
});

const mockPrisma = (await import('../../src/config/prisma.js')).default;
const { settingRepository } = await import('../../src/repositories/setting.repository.js');
const { mockCache } = await import('../../__mocks__/cache.js');

describe('settingRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findByKey', () => {
    it('mevcut ayari dondurur', async () => {
      const mockSetting = { id: '1', key: 'site.name', value: 'OBS', category: 'general' };
      mockCache.getOrSet.mockImplementation(async (_key, _ttl, fn) => fn());
      mockPrisma.systemSetting.findUnique.mockResolvedValue(mockSetting);

      const result = await settingRepository.findByKey('site.name');
      expect(result).toEqual(mockSetting);
    });
  });

  describe('upsert', () => {
    it('yeni ayar olusturur', async () => {
      const mockSetting = { id: '1', key: 'site.name', value: 'OBS', category: 'general' };
      mockPrisma.systemSetting.upsert.mockResolvedValue(mockSetting);
      mockCache.invalidatePattern.mockResolvedValue(undefined);

      const result = await settingRepository.upsert('site.name', 'OBS', 'general');
      expect(result).toEqual(mockSetting);
      expect(mockCache.invalidatePattern).toHaveBeenCalledWith('settings:*');
    });
  });
});
