import React from 'react';
import { ShieldCheck, MonitorSmartphone, MapPin, Clock } from 'lucide-react';
import { CardSkeleton } from '../ui';

export const LastLoginCard = ({ date, time, ip, device = 'Web Tarayıcı', isLoading }) => {
  if (isLoading) {
    return <CardSkeleton count={1} />;
  }

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldCheck size={18} color="var(--color-success)" />
        Son Giriş Bilgisi
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--color-surface-2)',
            padding: 12,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              padding: 8,
              borderRadius: '50%',
            }}
          >
            <Clock size={16} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>Tarih / Saat</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {date} - {time}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--color-surface-2)',
            padding: 12,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              padding: 8,
              borderRadius: '50%',
            }}
          >
            <MapPin size={16} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>IP Adresi</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{ip || '192.168.1.1'}</div>
          </div>
        </div>

        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--color-surface-2)',
            padding: 12,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              padding: 8,
              borderRadius: '50%',
            }}
          >
            <MonitorSmartphone size={16} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>Cihaz</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{device}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
