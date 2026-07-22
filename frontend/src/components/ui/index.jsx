import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ====== StatCard ======
export const StatCard = ({ label, value, icon: Icon, color = '#2563eb', trend, to }) => {
  const navigate = useNavigate();
  return (
    <div
      className={`stat-card ${to ? 'clickable card-hover' : ''}`}
      onClick={() => to && navigate(to)}
      style={{ cursor: to ? 'pointer' : 'default' }}
    >
      <div className="stat-icon" style={{ background: `${color}18` }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
        {trend && (
          <div style={{ fontSize: 12, color: trend > 0 ? '#10b981' : '#ef4444', marginTop: 2, fontWeight: 600 }}>
            {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};

// ====== PageHeader ======
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="page-header">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {action && <div style={{ flexShrink: 0 }}>{action}</div>}
  </div>
);

// ====== Badge ======
const statusConfig = {
  PENDING: { label: 'Beklemede', cls: 'badge-yellow' },
  ACTIVE: { label: 'Aktif', cls: 'badge-green' },
  APPROVED: { label: 'Onaylandı', cls: 'badge-green' },
  REJECTED: { label: 'Reddedildi', cls: 'badge-red' },
  COMPLETED: { label: 'Tamamlandı', cls: 'badge-blue' },
  DROPPED: { label: 'Bırakıldı', cls: 'badge-gray' },
  true: { label: 'Aktif', cls: 'badge-green' },
  false: { label: 'Pasif', cls: 'badge-red' },
  PRESENT: { label: 'Mevcut', cls: 'badge-green' },
  ABSENT: { label: 'Devamsız', cls: 'badge-red' },
  EXCUSED: { label: 'İzinli', cls: 'badge-yellow' },
  FALL: { label: 'Güz', cls: 'badge-blue' },
  SPRING: { label: 'Bahar', cls: 'badge-green' },
  SUMMER: { label: 'Yaz', cls: 'badge-yellow' },
  MIDTERM: { label: 'Vize', cls: 'badge-blue' },
  FINAL: { label: 'Final', cls: 'badge-purple' },
  MAKEUP: { label: 'Bütünleme', cls: 'badge-yellow' },
  GENERAL: { label: 'Genel', cls: 'badge-gray' },
  ACADEMIC: { label: 'Akademik', cls: 'badge-blue' },
  EXAM: { label: 'Sınav', cls: 'badge-red' },
  EVENT: { label: 'Etkinlik', cls: 'badge-purple' },
  ADMIN: { label: 'Yönetici', cls: 'badge-red' },
  ACADEMICIAN: { label: 'Akademisyen', cls: 'badge-blue' },
  STUDENT: { label: 'Öğrenci', cls: 'badge-green' },
};

export const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] ?? { label: String(status), cls: 'badge-gray' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
};

// ====== Skeleton ======
export const Skeleton = ({ height = 20, width = '100%', borderRadius = 6 }) => (
  <div className="skeleton" style={{ height, width, borderRadius }} />
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="table-container">
    <table className="table">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            {Array.from({ length: cols }).map((_, j) => (
              <td key={j}>
                <Skeleton height={16} width={j === 0 ? '60%' : '80%'} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const CardSkeleton = ({ count = 4 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Skeleton height={48} width={48} borderRadius={12} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton height={22} width="60%" />
          <Skeleton height={14} width="40%" />
        </div>
      </div>
    ))}
  </div>
);

// ====== EmptyState ======
export const EmptyState = ({ title = 'Kayıt bulunamadı', description, icon: Icon, action }) => (
  <div className="empty-state">
    {Icon && <Icon size={48} />}
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {action}
  </div>
);

// ====== ErrorState ======
export const ErrorState = ({ message = 'Veri yüklenirken bir hata oluştu', onRetry }) => (
  <div className="error-state">
    <div style={{ fontSize: 40 }}>⚠️</div>
    <h3>Hata</h3>
    <p>{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-secondary" style={{ marginTop: 8 }}>
        Tekrar Dene
      </button>
    )}
  </div>
);

// ====== Pagination ======
export const Pagination = ({ page, limit, total, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderTop: '1px solid var(--color-border)',
        fontSize: 13,
        color: 'var(--color-text-secondary)',
      }}
    >
      <span>
        Toplam <strong>{total}</strong> kayıt, {totalPages} sayfa
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="btn btn-ghost btn-sm">
          ‹
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p = i + 1;
          if (totalPages > 5 && page > 3) p = page - 2 + i;
          if (p > totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
              style={{ minWidth: 32 }}
            >
              {p}
            </button>
          );
        })}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="btn btn-ghost btn-sm">
          ›
        </button>
      </div>
    </div>
  );
};

// ====== SearchInput ======
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({ value, onChange, placeholder = 'Ara...' }) => {
  const [local, setLocal] = useState(value || '');
  const timerRef = useRef(null);

  useEffect(() => {
    setLocal(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocal(e.target.value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(e.target.value), 400);
  };

  return (
    <div style={{ position: 'relative', minWidth: 220 }}>
      <Search
        size={15}
        style={{
          position: 'absolute',
          left: 11,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-muted)',
        }}
      />
      <input
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        className="input"
        style={{ paddingLeft: 34, paddingRight: local ? 32 : 14 }}
      />
      {local && (
        <button
          onClick={() => {
            setLocal('');
            onChange('');
          }}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            display: 'flex',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// ====== FilterBar ======
export const FilterBar = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>{children}</div>
);

// ====== ConfirmDialog ======
export const ConfirmDialog = ({
  open,
  isOpen,
  title,
  message,
  description,
  onConfirm,
  onCancel,
  onClose,
  danger = true,
}) => {
  const visible = open ?? isOpen;
  const handleCancel = onCancel ?? onClose;
  const text = message ?? description;
  if (!visible) return null;
  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-box confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>{danger ? '⚠️' : '❓'}</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)' }}>
            {title}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{text}</p>
        </div>
        <div className="confirm-actions">
          <button onClick={handleCancel} className="btn btn-secondary">
            İptal
          </button>
          <button onClick={onConfirm} className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}>
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
};

// ====== Modal ======
export const Modal = ({ open, isOpen, onClose, title, children, maxWidth = 520 }) => {
  const visible = open ?? isOpen;
  if (!visible) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              display: 'flex',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ====== Tabs ======
export const Tabs = ({ tabs, active, onChange }) => (
  <div className="tabs-list">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        className={`tab-trigger ${active === tab.id ? 'active' : ''}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
        {tab.badge !== undefined && (
          <span className="badge badge-blue" style={{ marginLeft: 6, padding: '1px 6px', fontSize: 11 }}>
            {tab.badge}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ====== RoleGuardedAction ======
export const RoleGuardedAction = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const roleName = typeof user?.role === 'object' ? user.role?.name : user?.role;
  if (!user || !allowedRoles.includes(roleName)) return null;
  return children;
};
