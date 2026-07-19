import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../api/system.api';
import { PageHeader, FilterBar, TableSkeleton, ErrorState, EmptyState, ConfirmDialog, Modal } from '../../components/ui/index';
import { Megaphone, Search, Trash2, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

const AnnouncementList = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleName = typeof user?.role === 'object' ? user.role?.name : user?.role;
  const isAdmin = roleName === 'ADMIN';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['announcements', page, search],
    queryFn: () => getAnnouncements({ page, limit: 12, search }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      toast.success('Duyuru yayınlandı');
      qc.invalidateQueries({ queryKey: ['announcements'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Yayınlanamadı'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      toast.success('Duyuru silindi');
      qc.invalidateQueries({ queryKey: ['announcements'] });
      setDeleteConfirm(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Silinemedi'),
  });

  const handleCreate = (d) => {
    createMutation.mutate({ ...d, publishedAt: new Date().toISOString() });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Duyurular"
        subtitle="Genel sistem, akademik ve idari duyurular"
        action={isAdmin ? { label: 'Yeni Duyuru', icon: Megaphone, onClick: () => { reset(); setIsModalOpen(true); } } : undefined}
      />

      <FilterBar>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Duyurularda ara..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </FilterBar>

      {isLoading ? (
        <TableSkeleton rows={3} cols={1} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.data?.length ? (
        <EmptyState icon={Megaphone} title="Duyuru bulunamadı" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.data.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer', transition: 'all 0.2s', padding: 20 }} onClick={() => navigate(`/announcements/${item.id}`)}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Megaphone size={20} color="var(--color-primary-600)" />
              </div>
              <div style={{ flex: 1 }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isAdmin && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item); }}
                  >
                    <Trash2 size={16} color="var(--color-danger)" />
                  </button>
                )}
                <ChevronRight size={20} color="var(--color-text-muted)" />
              </div>
            </div>
          ))}

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div style={{ display: 'flex', gap: 10, padding: 16, justifyContent: 'center' }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Önceki</button>
              <div style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>{page} / {data.pagination.totalPages}</div>
              <button className="btn btn-secondary btn-sm" disabled={page === data.pagination.totalPages} onClick={() => setPage(p => p + 1)}>Sonraki</button>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Duyuru Yayınla">
        <form onSubmit={handleSubmit(handleCreate)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-wrapper">
            <label className="input-label">Başlık *</label>
            <input type="text" className={`input ${errors.title ? 'error' : ''}`} {...register('title', { required: true })} />
          </div>
          <div className="input-wrapper">
            <label className="input-label">İçerik *</label>
            <textarea className={`input ${errors.content ? 'error' : ''}`} rows={6} {...register('content', { required: true })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Yayınlanıyor...' : 'Yayınla'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteMutation.mutate(deleteConfirm.id)}
        title="Duyuruyu Sil"
        description="Bu duyuruyu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, Sil"
        confirmColor="var(--color-danger)"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AnnouncementList;
