import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/config/prisma.js', async () => {
  const { default: mockPrisma } = await import('./prisma.js');
  return { default: mockPrisma };
});

jest.unstable_mockModule('../src/utils/cache.js', async () => {
  const { mockCache } = await import('./cache.js');
  return { cache: mockCache };
});
