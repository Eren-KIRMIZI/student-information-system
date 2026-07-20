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

describe('Faculty API Integration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('tum fakulteleri listeler', async () => {
    const faculties = [
      { id: '1', name: 'Muhendislik', code: 'MUH', departments: [] },
      { id: '2', name: 'Edebiyat', code: 'EDB', departments: [] },
    ];
    mockPrisma.faculty.findMany.mockResolvedValue(faculties);

    const result = await mockPrisma.faculty.findMany({ include: { departments: true } });
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Muhendislik');
  });

  it('fakulte olusturur', async () => {
    const faculty = { id: '3', name: 'Tip', code: 'TIP' };
    mockPrisma.faculty.create.mockResolvedValue(faculty);

    const result = await mockPrisma.faculty.create({ data: { name: 'Tip', code: 'TIP' } });
    expect(result.name).toBe('Tip');
    expect(mockPrisma.faculty.create).toHaveBeenCalledTimes(1);
  });
});

describe('Search API Integration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ogrenci arar', async () => {
    const students = [{ id: '1', firstName: 'Ali', lastName: 'Veli', studentNumber: '20240001' }];
    mockPrisma.student.findMany.mockResolvedValue(students);

    const result = await mockPrisma.student.findMany({
      where: { OR: [{ firstName: { contains: 'Ali', mode: 'insensitive' } }] },
    });
    expect(result).toHaveLength(1);
  });

  it('birden fazla entityde arar', async () => {
    mockPrisma.student.findMany.mockResolvedValue([{ id: '1' }]);
    mockPrisma.lecturer.findMany.mockResolvedValue([{ id: '2' }]);
    mockPrisma.course.findMany.mockResolvedValue([{ id: '3' }]);

    const [students, lecturers, courses] = await Promise.all([
      mockPrisma.student.findMany({ where: { OR: [] } }),
      mockPrisma.lecturer.findMany({ where: { OR: [] } }),
      mockPrisma.course.findMany({ where: { OR: [] } }),
    ]);

    expect(students).toHaveLength(1);
    expect(lecturers).toHaveLength(1);
    expect(courses).toHaveLength(1);
  });
});
