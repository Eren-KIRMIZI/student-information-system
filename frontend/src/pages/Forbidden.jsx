import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldOff } from 'lucide-react';

const roleMap = {
  ADMIN: '/admin/dashboard',
  ACADEMICIAN: '/academician/dashboard',
  STUDENT: '/student/dashboard',
};

const Forbidden = () => {
  const { user } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ShieldOff size={36} color="#dc2626" />
      </div>
      <h1 style={{ fontSize: 48, fontWeight: 900, color: 'var(--color-text-primary)', margin: 0 }}>403</h1>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>Erişim Reddedildi</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 380 }}>
        Bu sayfaya erişim yetkiniz yok. Lütfen yöneticinizle iletişime geçin.
      </p>
      <Link
        to={user ? roleMap[user.role] || '/' : '/login'}
        className="btn btn-primary"
        style={{ textDecoration: 'none', marginTop: 8 }}
      >
        Dashboard'a Dön
      </Link>
    </div>
  );
};

export default Forbidden;
