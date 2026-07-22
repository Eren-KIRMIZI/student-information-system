import React from 'react';
import { Clock } from 'lucide-react';
import { CardSkeleton, EmptyState, ErrorState } from '../ui';

export const RecentActivity = ({ activities = [], isLoading, isError, onRetry }) => {
  return (
    <div className="card" style={{ height: '100%' }}>
      <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={18} color="var(--color-text-muted)" />
        Son Aktiviteler
      </div>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : isError ? (
        <ErrorState message="Aktiviteler yüklenemedi." onRetry={onRetry} />
      ) : activities.length === 0 ? (
        <EmptyState title="Aktivite Yok" description="Son aktivite bulunmamaktadır." />
      ) : (
        <div style={{ position: 'relative', paddingLeft: 12 }}>
          {/* Timeline Line */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              bottom: 8,
              left: 16,
              width: 2,
              background: 'var(--color-border)',
              borderRadius: 2,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activities.map((activity, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: activity.color || '#3b82f6',
                    position: 'relative',
                    zIndex: 2,
                    marginTop: 4,
                    marginLeft: -1,
                  }}
                />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>{activity.time}</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{activity.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
