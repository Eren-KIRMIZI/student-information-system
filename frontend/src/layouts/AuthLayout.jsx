import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        background:
          'linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-700) 50%, var(--color-primary-600) 100%)',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
            top: -100,
            right: -100,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            bottom: -50,
            left: -50,
          }}
        />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          animation: 'scaleIn 0.3s ease',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              padding: 20,
              borderRadius: 28,
              marginBottom: 16,
              boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
            }}
          >
            <img src="/Uni-Photoroom.png" alt="Eren Teknik" style={{ width: 160, height: 160, objectFit: 'contain' }} />
          </div>
          <h1
            style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
          >
            Eren Teknik Üniversitesi
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4, letterSpacing: '0.05em' }}>
            ÖĞRENCİ BİLGİ SİSTEMİ
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 20,
            padding: 32,
            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Outlet />
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 20 }}>
          © 2026 Eren Teknik Üniversitesi — Tüm hakları saklıdır
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
