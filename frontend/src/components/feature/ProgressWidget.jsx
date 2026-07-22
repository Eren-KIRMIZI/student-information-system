import React from 'react';
import { Target } from 'lucide-react';

export const ProgressWidget = ({ title, current, total, color = '#3b82f6', suffix = '' }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div style={{ padding: '16px', background: 'var(--color-background)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Target size={14} color={color} /> {title}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {current} <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontWeight: 500 }}>/ {total} {suffix}</span>
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: color }}>
          %{percentage}
        </div>
      </div>
      
      <div style={{ width: '100%', height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: color, 
          borderRadius: 4,
          transition: 'width 1s ease-out'
        }} />
      </div>
    </div>
  );
};
