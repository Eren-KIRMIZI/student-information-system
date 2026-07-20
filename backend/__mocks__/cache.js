import { jest } from '@jest/globals';

const mockCache = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  invalidatePattern: jest.fn().mockResolvedValue(undefined),
  getOrSet: jest.fn().mockImplementation(async (_key, _ttl, fn) => fn()),
};

jest.unstable_mockModule('../src/utils/cache.js', () => ({
  cache: mockCache,
}));

export { mockCache };
