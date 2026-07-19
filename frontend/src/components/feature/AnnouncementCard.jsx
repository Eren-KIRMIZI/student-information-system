import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { Megaphone, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AnnouncementCard = ({ item, showActions, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div
      className="card"
      style={{ display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer', transition: 'all 0.2s', padding: 20 }}
      onClick={() => navigate(`/announcements/${item.id}`)}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Megaphone size={20} color="var(--color-primary-600)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>{item.title}</h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
          {item.content}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={12} /> {dayjs(item.publishedAt).format('DD MMMM YYYY, HH:mm')}
          </span>
        </div>
      </div>
      {showActions && onDelete && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={(e) => { e.stopPropagation(); onDelete(item); }}
          style={{ color: 'var(--color-danger)' }}
        >
          Sil
        </button>
      )}
    </div>
  );
};
