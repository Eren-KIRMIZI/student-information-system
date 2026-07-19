import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { EXAM_TYPE_LABELS } from '../../utils/constants';

export const ExamListItem = ({ exam }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'var(--color-surface-2)', borderRadius: 10,
    border: '1px solid var(--color-border)',
  }}>
    <div>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{exam.courseSection?.course?.name}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
        {dayjs(exam.examDate).format('DD MMM YYYY')} · {exam.startTime}–{exam.endTime} · {exam.classroom}
      </div>
    </div>
    <span className="badge badge-blue">{EXAM_TYPE_LABELS[exam.examType] ?? exam.examType}</span>
  </div>
);
