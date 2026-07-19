import { StatusBadge } from '../ui/index';
import { Users } from 'lucide-react';

export const CourseSectionCard = ({ section, onClick, action, showQuota = true }) => {
  const enrolled = section._count?.enrollments ?? 0;
  const remaining = section.remainingQuota ?? (section.quota - enrolled);
  const isFull = remaining <= 0;

  return (
    <div
      className="card"
      style={{ cursor: onClick ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', gap: 12, transition: 'transform 0.15s, box-shadow 0.15s' }}
      onClick={onClick}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; } }}
      onMouseLeave={(e) => { if (onClick) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <span className="badge badge-blue">{section.course?.code}</span>
        <StatusBadge status={section.semester} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4 }}>{section.course?.name}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        {section.lecturer ? `${section.lecturer.firstName} ${section.lecturer.lastName}` : '—'}
        {' · Şube '}{section.sectionCode}
      </div>
      {showQuota && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={14} /> {enrolled}/{section.quota}
          </span>
          <span style={{ color: isFull ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
            {isFull ? 'Dolu' : `${remaining} boş`}
          </span>
        </div>
      )}
      {action && <div style={{ marginTop: 'auto' }}>{action}</div>}
    </div>
  );
};
