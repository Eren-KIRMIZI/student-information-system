import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

const NotFound = () => (
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
        background: 'var(--color-surface-3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SearchX size={36} color="var(--color-text-muted)" />
    </div>
    <h1 style={{ fontSize: 48, fontWeight: 900, color: 'var(--color-text-primary)', margin: 0 }}>404</h1>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>Sayfa Bulunamadı</h2>
    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 380 }}>
      Aradığınız sayfa mevcut değil veya taşınmış olabilir.
    </p>
    <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>
      Ana Sayfaya Dön
    </Link>
  </div>
);

export default NotFound;
