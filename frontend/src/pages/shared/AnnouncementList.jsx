import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../api/system.api';
import {
  PageHeader,
  SearchInput,
  FilterBar,
  TableSkeleton,
  ErrorState,
  EmptyState,
  ConfirmDialog,
  Modal,
} from '../../components/ui/index';
import { AnnouncementCard } from '../../components/feature/index';
import { Megaphone, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Pagination } from '../../components/ui/index';
import { useAnnouncementSocket } from '../../hooks/useSocket';

const AnnouncementList = () => {
  useAnnouncementSocket();
  const qc = useQueryClient();
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

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
        action={
          isAdmin ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                reset();
                setIsModalOpen(true);
              }}
            >
              <Megaphone size={16} /> Yeni Duyuru
            </button>
          ) : undefined
        }
      />

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Duyurularda ara..."
          style={{ maxWidth: 400 }}
        />
      </FilterBar>

      {isLoading ? (
        <TableSkeleton rows={3} cols={1} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.data?.length ? (
        <EmptyState icon={Megaphone} title="Duyuru bulunamadı" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.data.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <AnnouncementCard item={item} />
              </div>
              {isAdmin && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 8, color: 'var(--color-danger)', flexShrink: 0 }}
                  onClick={() => setDeleteConfirm(item)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="card" style={{ padding: 0 }}>
              <Pagination {...data.pagination} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Duyuru Yayınla">
        <form onSubmit={handleSubmit(handleCreate)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-wrapper">
            <label className="input-label">Başlık *</label>
            <input
              type="text"
              className={`input ${errors.title ? 'error' : ''}`}
              {...register('title', { required: true })}
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label">İçerik *</label>
            <textarea
              className={`input ${errors.content ? 'error' : ''}`}
              rows={6}
              {...register('content', { required: true })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
              İptal
            </button>
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
