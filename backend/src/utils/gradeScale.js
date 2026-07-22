const GRADE_THRESHOLDS = [
  { min: 90, letter: 'AA', point: 4.0 },
  { min: 85, letter: 'BA', point: 3.5 },
  { min: 80, letter: 'BB', point: 3.0 },
  { min: 75, letter: 'CB', point: 2.5 },
  { min: 70, letter: 'CC', point: 2.0 },
  { min: 65, letter: 'DC', point: 1.5 },
  { min: 60, letter: 'DD', point: 1.0 },
  { min: 50, letter: 'FD', point: 0.5 },
];

export const GRADE_POINT_MAP = Object.fromEntries(GRADE_THRESHOLDS.map((t) => [t.letter, t.point]));
GRADE_POINT_MAP.FF = 0.0;

export const LETTER_GRADES = GRADE_THRESHOLDS.map((t) => t.letter).concat('FF');

export const computeLetterGrade = (midtermScore, finalScore, makeupScore) => {
  const effectiveFinal = makeupScore ?? finalScore;
  if (midtermScore == null || effectiveFinal == null) return { letter: null, point: null };
  const weighted = midtermScore * 0.4 + effectiveFinal * 0.6;
  for (const t of GRADE_THRESHOLDS) {
    if (weighted >= t.min) return { letter: t.letter, point: t.point };
  }
  return { letter: 'FF', point: 0.0 };
};

export const computeSemesterGPA = (grades) => {
  const active = grades.filter((g) => g.gradePoint != null && g.enrollment?.courseSection?.course?.credit);
  if (!active.length) return { gpa: 0, totalCredits: 0 };
  const totalCredits = active.reduce((s, g) => s + g.enrollment.courseSection.course.credit, 0);
  const totalPoints = active.reduce((s, g) => s + g.gradePoint * g.enrollment.courseSection.course.credit, 0);
  return { gpa: totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0, totalCredits };
};
