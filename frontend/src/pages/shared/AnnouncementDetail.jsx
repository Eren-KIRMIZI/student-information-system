import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnnouncement } from '../../api/system.api';
import { PageHeader, ErrorState, TableSkeleton } from '../../components/ui/index';
import { Megaphone, Calendar, ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['announcement', id],
    queryFn: () => getAnnouncement(id),
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Duyuru Yükleniyor" />
        <TableSkeleton rows={2} cols={1} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="animate-fade-in">
        <button className="btn btn-ghost" onClick={() => navigate('/announcements')} style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Duyurulara Dön
        </button>
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button
        className="btn btn-ghost"
        onClick={() => navigate('/announcements')}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        <ArrowLeft size={16} /> Duyurulara Dön
      </button>

      <div className="card" style={{ padding: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--color-primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Megaphone size={24} color="var(--color-primary-600)" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
              {data.title}
            </h1>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--color-text-muted)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={14} /> Yayınlanma: {dayjs(data.publishedAt).format('DD MMMM YYYY, HH:mm')}
              </span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>
          {data.content}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
