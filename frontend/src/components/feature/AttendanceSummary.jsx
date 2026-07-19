import { StatusBadge } from '../ui/index';
import { ATTENDANCE_LABELS } from '../../utils/constants';
import { getPercentage } from '../../utils/helpers';

export const AttendanceSummary = ({ section, records = [] }) => {
  const counts = records.reduce(
    (acc, r) => {
      if (r.status === 'PRESENT') acc.present++;
      else if (r.status === 'ABSENT') acc.absent++;
      else if (r.status === 'EXCUSED') acc.excused++;
      return acc;
    },
    { present: 0, absent: 0, excused: 0 }
  );

  const total = counts.present + counts.absent + counts.excused;
  const absencePct = getPercentage(counts.absent, total);
  const isRisky = absencePct >= 30;

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-success)' }}>{counts.present}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Katıldı</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-danger)' }}>{counts.absent}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Devamsız</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-warning)' }}>{counts.excused}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>İzinli</div>
      </div>
      {isRisky && (
        <span className="badge badge-red" style={{ fontSize: 11 }}>
          Devamsızlık sınırına yakın ({absencePct}%)
        </span>
      )}
    </div>
  );
};

export const AttendanceProgressBar = ({ records = [] }) => {
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const total = records.length;
  const pct = getPercentage(absent, total);
  const isRisky = pct >= 30;

  return (
    <div style={{ padding: '10px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
        <span>Devamsızlık oranı</span>
        <span style={{ fontWeight: 600, color: isRisky ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>%{pct}</span>
      </div>
      <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 6 }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 4,
          background: isRisky ? 'var(--color-danger)' : pct >= 20 ? 'var(--color-warning)' : 'var(--color-success)',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
};
