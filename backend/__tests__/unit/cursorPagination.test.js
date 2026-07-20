import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/prisma.js', async () => {
  const { default: mockPrisma } = await import('../../__mocks__/prisma.js');
  return { default: mockPrisma };
});

jest.unstable_mockModule('../../src/utils/cache.js', async () => {
  const { mockCache } = await import('../../__mocks__/cache.js');
  return { cache: mockCache };
});

const { cursorPagination } = await import('../../src/utils/cursorPagination.js');
const mockModel = {
  findMany: jest.fn(),
};

describe('cursorPagination', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findMany', () => {
    it('ilk sayfayi dondurur (cursor yok)', async () => {
      const items = Array.from({ length: 21 }, (_, i) => ({ id: `id-${i}`, name: `Item ${i}` }));
      mockModel.findMany.mockResolvedValue(items);

      const result = await cursorPagination.findMany({
        model: mockModel,
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      expect(result.data).toHaveLength(20);
      expect(result.hasNext).toBe(true);
      expect(result.nextCursor).toBe('id-19');
    });

    it('son sayfayi dondurur', async () => {
      const items = Array.from({ length: 5 }, (_, i) => ({ id: `id-${i}`, name: `Item ${i}` }));
      mockModel.findMany.mockResolvedValue(items);

      const result = await cursorPagination.findMany({
        model: mockModel,
        take: 20,
      });

      expect(result.data).toHaveLength(5);
      expect(result.hasNext).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('paginate', () => {
    it('hasNext dogru hesaplanir', () => {
      const items = Array.from({ length: 21 }, (_, i) => ({ id: `id-${i}` }));
      const result = cursorPagination.paginate(items, 20);

      expect(result.data).toHaveLength(20);
      expect(result.hasNext).toBe(true);
      expect(result.nextCursor).toBe('id-19');
    });

    it('bos liste dondurur', () => {
      const result = cursorPagination.paginate([], 20);
      expect(result.data).toHaveLength(0);
      expect(result.hasNext).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });
});
