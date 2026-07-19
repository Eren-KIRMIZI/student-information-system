import { GRADE_COLORS } from '../../utils/constants';

export const GradeBadge = ({ letter, size = 'md' }) => {
  if (!letter) return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;

  const color = GRADE_COLORS[letter] || '#94a3b8';
  const sizes = {
    sm: { padding: '2px 8px', fontSize: 12 },
    md: { padding: '3px 12px', fontSize: 14 },
    lg: { padding: '4px 16px', fontSize: 16 },
  };

  return (
    <span style={{
      display: 'inline-block',
      borderRadius: 20,
      fontWeight: 800,
      background: color + '22',
      color,
      ...sizes[size],
    }}>
      {letter}
    </span>
  );
};

export const GradeCell = ({ score, letter, isFinalized }) => (
  <>
    <td style={{ textAlign: 'center', fontWeight: 600 }}>{score ?? '—'}</td>
    <td style={{ textAlign: 'center' }}><GradeBadge letter={letter} /></td>
    <td style={{ textAlign: 'center' }}>
      {isFinalized
        ? <span className="badge badge-green">Kesinleşti</span>
        : score
          ? <span className="badge badge-yellow">Taslak</span>
          : <span className="badge badge-gray">Girilmedi</span>}
    </td>
  </>
);
