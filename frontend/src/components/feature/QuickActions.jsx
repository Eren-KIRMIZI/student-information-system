import React from 'react';
import { UserPlus, UserCog, BookPlus, Building, Megaphone, CalendarPlus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CardSkeleton, ErrorState } from '../ui';

const actions = [
  { label: 'Öğrenci Oluştur', icon: UserPlus, color: '#3b82f6', bg: '#eff6ff', path: '/admin/students' },
  { label: 'Akademisyen Oluştur', icon: UserCog, color: '#8b5cf6', bg: '#f5f3ff', path: '/admin/lecturers' },
  { label: 'Ders Oluştur', icon: BookPlus, color: '#10b981', bg: '#ecfdf5', path: '/admin/courses' },
  { label: 'Bölüm Oluştur', icon: Building, color: '#f59e0b', bg: '#fffbeb', path: '/admin/departments' },
  { label: 'Duyuru Yayınla', icon: Megaphone, color: '#ec4899', bg: '#fdf2f8', path: '/admin' },
  { label: 'Akademik Takvim', icon: CalendarPlus, color: '#6366f1', bg: '#eef2ff', path: '/admin' },
  { label: 'Danışman Ata', icon: UserCheck, color: '#14b8a6', bg: '#f0fdfa', path: '/admin/advisors' },
];

export const QuickActions = ({ isLoading, isError, onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ height: '100%' }}>
      <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 16 }}>Hızlı İşlemler</div>

      {isLoading ? (
        <CardSkeleton count={5} />
      ) : isError ? (
        <ErrorState message="Hızlı işlemler yüklenemedi." onRetry={onRetry} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => action.path && navigate(action.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${action.bg}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: action.bg,
                    color: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'center', color: 'var(--color-text)' }}>
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
