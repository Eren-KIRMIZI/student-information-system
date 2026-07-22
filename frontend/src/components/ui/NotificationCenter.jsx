import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Socket connection
  useEffect(() => {
    if (!user) return;

    // TODO: Gerçek endpoint ile değiştirin (örneğin localStorage'daki token)
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
    });

    socket.on('notification', (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Mock initial data for UI preview
    setNotifications([
      {
        id: 1,
        title: 'Notunuz Açıklandı',
        message: 'Bilgisayar Ağları dersi notunuz sisteme girildi.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: 2,
        title: 'Danışman Onayı',
        message: 'Ders seçimleriniz danışmanınız tarafından onaylandı.',
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: 3,
        title: 'Devamsızlık Uyarısı',
        message: 'Veritabanı Yönetim Sistemleri dersi devamsızlık sınırına yaklaştınız.',
        type: 'warning',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ]);
    setUnreadCount(2);

    return () => socket.disconnect();
  }, [user]);

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => {
      const isUnread = !prev.find((n) => n.id === id)?.read;
      if (isUnread) setUnreadCount((count) => Math.max(0, count - 1));
      return prev.filter((n) => n.id !== id);
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} color="#10b981" />;
      case 'warning':
        return <AlertCircle size={16} color="#f59e0b" />;
      default:
        return <Bell size={16} color="#3b82f6" />;
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '50%',
          width: 36,
          height: 36,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          position: 'relative',
          transition: 'all 0.15s',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              background: '#ef4444',
              color: 'white',
              fontSize: 10,
              fontWeight: 'bold',
              width: 16,
              height: 16,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--color-surface)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 340,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 400,
            animation: 'scaleIn 0.15s ease both',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-surface-2)',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Bildirimler
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 500,
                  padding: 0,
                }}
              >
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                <Bell size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
                <br />
                Yeni bildirim yok
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: 12,
                    background: notif.read ? 'transparent' : 'var(--color-surface-2)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (notif.read) e.currentTarget.style.background = 'var(--color-surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    if (notif.read) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 4,
                      }}
                    >
                      <strong
                        style={{
                          fontSize: 13,
                          color: notif.read ? 'var(--color-text-primary)' : '#1e3a5f',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {notif.title}
                      </strong>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--color-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={10} />
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {notif.message}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    title="Sil"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      alignSelf: 'flex-start',
                      opacity: 0.5,
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = 1;
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = 0.5;
                      e.currentTarget.style.color = 'var(--color-text-muted)';
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '8px',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
              background: 'var(--color-surface)',
            }}
          >
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 500,
                padding: '4px 8px',
              }}
            >
              Tüm Bildirimleri Gör
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
