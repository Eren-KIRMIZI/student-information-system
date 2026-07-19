import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '../../api/system.api';
import { PageHeader, FilterBar, TableSkeleton, ErrorState, EmptyState, ConfirmDialog, Modal } from '../../components/ui/index';
import { CalendarDays, Plus, Trash2, Search, Calendar as CalIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

const AcademicCalendar = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const roleName = typeof user?.role === 'object' ? user.role?.name : user?.role;
  const isAdmin = roleName === 'ADMIN';

  const [year, setYear] = useState('2026-2027');
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['academic-calendar', year, search],
    queryFn: () => getCalendarEvents({ academicYear: year, search }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createMutation = useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: () => {
      toast.success('Olay takvime eklendi');
      qc.invalidateQueries({ queryKey: ['academic-calendar'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Eklenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: () => {
      toast.success('Olay silindi');
      qc.invalidateQueries({ queryKey: ['academic-calendar'] });
      setDeleteConfirm(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Silinemedi'),
  });

  const handleCreate = (d) => {
    createMutation.mutate(d);
  };

  const typeColor = { ACADEMIC: 'badge-blue', HOLIDAY: 'badge-yellow', EXAM: 'badge-red', REGISTRATION: 'badge-purple' };
  const typeLabel = { ACADEMIC: 'Akademik', HOLIDAY: 'Tatil', EXAM: 'Sınav', REGISTRATION: 'Kayıt' };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Akademik Takvim"
        subtitle="Önemli tarihler, sınav dönemleri ve tatiller"
        action={isAdmin ? { label: 'Yeni Etkinlik', icon: Plus, onClick: () => { reset(); setIsModalOpen(true); } } : undefined}
      />

      <FilterBar>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Etkinlik ara..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input" style={{ width: 160 }} value={year} onChange={e => setYear(e.target.value)}>
          <option value="2026-2027">2026-2027</option>
          <option value="2025-2026">2025-2026</option>
        </select>
      </FilterBar>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.data?.length ? (
          <EmptyState icon={CalendarDays} title="Takvim boş" description="Seçili dönem için kayıtlı etkinlik bulunamadı." />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Tarih Aralığı</th>
                  <th>Etkinlik Adı</th>
                  <th>Tür</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>İşlem</th>}
                </tr>
              </thead>
              <tbody>
                {data.data.map(item => (
                  <tr key={item.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                        <CalIcon size={14} color="var(--color-text-muted)" />
                        {dayjs(item.startDate).format('DD MMM')} {item.endDate ? `- ${dayjs(item.endDate).format('DD MMM YYYY')}` : dayjs(item.startDate).format('YYYY')}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.title}</td>
                    <td>
                      <span className={`badge ${typeColor[item.type] || 'badge-gray'}`}>
                        {typeLabel[item.type] || item.type}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(item)}>
                          <Trash2 size={16} color="var(--color-danger)" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Etkinlik Ekle">
        <form onSubmit={handleSubmit(handleCreate)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-wrapper">
            <label className="input-label">Başlık *</label>
            <input type="text" className={`input ${errors.title ? 'error' : ''}`} {...register('title', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-wrapper">
              <label className="input-label">Başlangıç Tarihi *</label>
              <input type="date" className={`input ${errors.startDate ? 'error' : ''}`} {...register('startDate', { required: true })} />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Bitiş Tarihi</label>
              <input type="date" className="input" {...register('endDate')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-wrapper">
              <label className="input-label">Tür *</label>
              <select className={`input ${errors.type ? 'error' : ''}`} {...register('type', { required: true })}>
                <option value="ACADEMIC">Akademik</option>
                <option value="REGISTRATION">Kayıt</option>
                <option value="EXAM">Sınav</option>
                <option value="HOLIDAY">Tatil</option>
              </select>
            </div>
            <div className="input-wrapper">
              <label className="input-label">Akademik Yıl *</label>
              <input type="text" className={`input ${errors.academicYear ? 'error' : ''}`} defaultValue="2026-2027" {...register('academicYear', { required: true })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteMutation.mutate(deleteConfirm.id)}
        title="Etkinliği Sil"
        description="Bu takvim etkinliğini silmek istediğinize emin misiniz?"
        confirmText="Evet, Sil"
        confirmColor="var(--color-danger)"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AcademicCalendar;
