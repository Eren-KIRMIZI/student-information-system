import React from 'react';
import { Activity, Server, Database, HardDrive, Cpu, MemoryStick } from 'lucide-react';

export const SystemHealth = () => {
  // Mock data for system health
  const metrics = [
    { label: 'API', status: 'Healthy', icon: Server, color: '#10b981' },
    { label: 'PostgreSQL', status: 'Connected', icon: Database, color: '#10b981' },
    { label: 'Redis', status: 'Connected', icon: HardDrive, color: '#10b981' },
    { label: 'Socket', status: '142 Active', icon: Activity, color: '#3b82f6' },
    { label: 'Queue', status: 'Running', icon: Activity, color: '#10b981' },
  ];

  return (
    <div className="card">
      <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Activity size={18} color="var(--color-text-muted)" />
        Sistem Sağlığı
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} style={{ 
              display: 'flex', alignItems: 'center', gap: 12, 
              padding: '12px', borderRadius: 8, border: '1px solid var(--color-border)',
              background: 'var(--color-surface)'
            }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', 
                background: `${metric.color}15`, color: metric.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={16} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>{metric.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: metric.color }}>{metric.status}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ padding: 12, background: 'var(--color-background)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)' }}>
              <Cpu size={14} /> CPU
            </span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>18%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '18%', height: '100%', background: '#10b981', borderRadius: 3 }} />
          </div>
        </div>
        
        <div style={{ padding: 12, background: 'var(--color-background)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)' }}>
              <MemoryStick size={14} /> RAM
            </span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>42%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '42%', height: '100%', background: '#f59e0b', borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
};
