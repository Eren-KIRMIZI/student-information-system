import React from 'react';
import { Bell } from 'lucide-react';
import { CardSkeleton, EmptyState, ErrorState } from '../ui';

export const NotificationWidget = ({ notifications = [], isLoading, isError, onRetry }) => {
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'red': return '#ef4444'; // 🔴
      case 'orange': return '#f97316'; // 🟠
      case 'yellow': return '#eab308'; // 🟡
      case 'green': return '#22c55e'; // 🟢
      default: return '#6b7280';
    }
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Bell size={18} color="var(--color-text-muted)" />
        Bildirimler & Uyarılar
      </div>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : isError ? (
        <ErrorState message="Bildirimler yüklenemedi." onRetry={onRetry} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.length > 0 ? (
            notifications.map((notif, idx) => (
              <div key={idx} style={{ 
                display: 'flex', alignItems: 'center', gap: 12, 
                padding: '12px', borderRadius: 8, 
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ 
                  width: 12, height: 12, borderRadius: '50%', 
                  background: getStatusColor(notif.status),
                  boxShadow: `0 0 8px ${getStatusColor(notif.status)}80`
                }} />
                <div style={{ fontSize: 14, color: 'var(--color-text)' }}>
                  <span style={{ fontWeight: 600 }}>{notif.count && `${notif.count} `}</span>
                  {notif.text}
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 12, 
              padding: '12px', borderRadius: 8, 
              background: 'var(--color-background)',
              border: '1px solid var(--color-border)'
            }}>
               <div style={{ 
                  width: 12, height: 12, borderRadius: '50%', 
                  background: getStatusColor('green'),
                  boxShadow: `0 0 8px ${getStatusColor('green')}80`
                }} />
                <div style={{ fontSize: 14, color: 'var(--color-text)' }}>
                  Sistem normal çalışıyor
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
