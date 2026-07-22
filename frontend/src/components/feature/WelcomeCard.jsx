import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '../ui';

export const WelcomeCard = ({ user, roleLabel, messages = [], isLoading }) => {
  if (isLoading) {
    return (
      <div
        className="card"
        style={{
          marginBottom: 24,
          background: 'linear-gradient(to right, var(--color-primary-600), var(--color-primary-800))',
          color: 'white',
        }}
      >
        <Skeleton height={28} width="40%" />
        <Skeleton height={20} width="60%" />
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        marginBottom: 24,
        background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
        color: 'white',
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
        <Sparkles size={120} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0' }}>
          Merhaba {user?.firstName || 'Kullanıcı'} 👋
        </h2>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>{roleLabel} Paneline Hoş Geldiniz</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.15)',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                backdropFilter: 'blur(4px)',
              }}
            >
              <CheckCircle2 size={16} />
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
