export const SEMESTER_LABELS = { FALL: 'Güz', SPRING: 'Bahar', SUMMER: 'Yaz' };
export const SEMESTERS = ['FALL', 'SPRING', 'SUMMER'];

export const DAY_LABELS = {
  MONDAY: 'Pazartesi', TUESDAY: 'Salı', WEDNESDAY: 'Çarşamba',
  THURSDAY: 'Perşembe', FRIDAY: 'Cuma', SATURDAY: 'Cumartesi', SUNDAY: 'Pazar',
};

export const DAY_LABELS_SHORT = {
  MONDAY: 'Pzt', TUESDAY: 'Sal', WEDNESDAY: 'Çar',
  THURSDAY: 'Per', FRIDAY: 'Cum', SATURDAY: 'Cmt', SUNDAY: 'Paz',
};

export const EXAM_TYPE_LABELS = { MIDTERM: 'Vize', FINAL: 'Final', MAKEUP: 'Bütünleme' };

export const ATTENDANCE_LABELS = { PRESENT: 'Katıldı', ABSENT: 'Devamsız', EXCUSED: 'İzinli' };
export const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'EXCUSED'];

export const LETTER_GRADES = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF', 'NA'];

export const GRADE_COLORS = {
  AA: '#2563eb', BA: '#14b8a6', BB: '#10b981', CB: '#22c55e',
  CC: '#84cc16', DC: '#eab308', DD: '#f59e0b', FD: '#f97316', FF: '#ef4444',
};

export const CLASS_YEARS = [1, 2, 3, 4, 5];
export const CLASS_YEAR_OPTIONS = CLASS_YEARS;

export const SEMESTER_OPTIONS = SEMESTERS.map((s) => ({ value: s, label: SEMESTER_LABELS[s] }));
export const DAY_LABEL_SHORT = DAY_LABELS_SHORT;

export const LECTURER_TITLES = [
  'Dr.', 'Dr. Öğr. Üyesi', 'Doç. Dr.', 'Prof. Dr.', 'Arş. Gör.', 'Öğr. Gör.',
];

export const ACADEMIC_YEAR_OPTIONS = (() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - 2 + i;
    return `${y}-${y + 1}`;
  });
})();

export const CURRENT_ACADEMIC_YEAR = (() => {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
})();

export const MAX_ECTS_PER_SEMESTER = 45;
