import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, Menu, User, KeyRound, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationCenter from '../ui/NotificationCenter';

const roleLabel = { ADMIN: 'Yönetici', ACADEMICIAN: 'Akademisyen', STUDENT: 'Öğrenci' };
const roleColor = { ADMIN: 'badge-red', ACADEMICIAN: 'badge-blue', STUDENT: 'badge-green' };

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropOpen(false);
    await logout();
    navigate('/login');
  };

  const displayName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email?.split('@')[0] || 'Kullanıcı';

  return (
    <header className="layout-topbar">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-secondary)', padding: 6, borderRadius: 8,
          display: 'flex', alignItems: 'center',
        }}
        className="hamburger-btn"
      >
        <Menu size={22} />
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Center */}
        <NotificationCenter />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Karanlık mod' : 'Aydınlık mod'}
        style={{
          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          borderRadius: 8, padding: '7px 8px', cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          display: 'flex', alignItems: 'center',
          transition: 'all 0.15s',
        }}
      >
        {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
      </button>

      {/* User dropdown */}
      <div ref={dropRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setDropOpen((o) => !o)}
          className="flex items-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[10px] p-1.5 sm:px-3 sm:py-1.5 cursor-pointer transition-all duration-150"
        >
          {/* Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
              {displayName}
            </span>
            <span className={`badge ${roleColor[user?.role]} `} style={{ padding: '1px 6px', fontSize: 10, marginTop: 2 }}>
              {roleLabel[user?.role]}
            </span>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', marginLeft: 2 }} />
        </button>

        {/* Dropdown menu */}
        {dropOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 12, padding: '6px', minWidth: 180,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 100,
            animation: 'scaleIn 0.15s ease both',
          }}>
            <Link
              to="/profile"
              onClick={() => setDropOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: 'var(--color-text-primary)', textDecoration: 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <User size={15} />
              Profilim
            </Link>
            <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 8px' }} />
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: 'var(--color-danger)', width: '100%', border: 'none',
                background: 'none', cursor: 'pointer', transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={15} />
              Çıkış Yap
            </button>
          </div>
        )}
      </div>
      </div>
    </header>
  );
};

export default Topbar;
