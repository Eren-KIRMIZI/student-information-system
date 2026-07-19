import { StatusBadge } from '../ui/index';
import { formatFullName } from '../../utils/helpers';
import { Clock } from 'lucide-react';
import dayjs from 'dayjs';

export const DashboardListItem = ({ icon: Icon, iconBg, iconColor, title, subtitle, badge, badgeStatus, trailing, onClick }) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: 8,
      border: '1px solid var(--color-border)', cursor: onClick ? 'pointer' : 'default',
      transition: 'background 0.15s',
    }}
    onClick={onClick}
    onMouseEnter={(e) => { if (onClick) e.currentTarget.style.background = 'var(--color-surface-3)'; }}
    onMouseLeave={(e) => { if (onClick) e.currentTarget.style.background = 'var(--color-surface-2)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      {Icon && (
        <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg || '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={iconColor || '#2563eb'} />
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</div>}
      </div>
    </div>
    <div style={{ flexShrink: 0, marginLeft: 8 }}>
      {badgeStatus ? <StatusBadge status={badgeStatus} /> : badge}
    </div>
  </div>
);

export const DashboardCard = ({ icon: Icon, iconBg, iconColor, title, children, emptyIcon: EmptyIcon, emptyTitle }) => (
  <div className="card">
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg || '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={iconColor || '#2563eb'} />
      </div>
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h2>
    </div>
    {children}
  </div>
);
