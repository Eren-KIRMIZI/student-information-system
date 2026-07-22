import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFaculties, createFaculty, updateFaculty, deleteFaculty } from '../../api/academic.api';
import {
  PageHeader,
  SearchInput,
  StatusBadge,
  TableSkeleton,
  EmptyState,
  ErrorState,
  Pagination,
  Modal,
  ConfirmDialog,
} from '../../components/ui/index';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const FacultyList = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['faculties', page, search],
    queryFn: () => getFaculties({ page, limit: 20, search }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const openAdd = () => {
    setEditItem(null);
    reset({});
    setFormOpen(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    reset({ name: item.name, code: item.code });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (d) => (editItem ? updateFaculty(editItem.id, d) : createFaculty(d)),
    onSuccess: () => {
      toast.success(editItem ? 'Fakülte güncellendi' : 'Fakülte oluşturuldu');
      qc.invalidateQueries({ queryKey: ['faculties'] });
      setFormOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'İşlem başarısız'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFaculty(id),
    onSuccess: () => {
      toast.success('Fakülte silindi');
      qc.invalidateQueries({ queryKey: ['faculties'] });
      setDeleteItem(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Silinemedi'),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Fakülte Yönetimi"
        subtitle={`Toplam ${data?.pagination?.total ?? 0} fakülte`}
        action={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Fakülte Ekle
          </button>
        }
      />

      <div className="filter-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Fakülte ara..." />
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.data?.length ? (
          <EmptyState
            icon={Building2}
            title="Fakülte bulunamadı"
            action={
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={15} />
                Fakülte Ekle
              </button>
            }
          />
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Fakülte Adı</th>
                    <th>Kod</th>
                    <th>Bölüm Sayısı</th>
                    <th style={{ width: 80 }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((f) => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.name}</td>
                      <td>
                        <span className="badge badge-blue">{f.code}</span>
                      </td>
                      <td>{f._count?.departments ?? 0} bölüm</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(f)} title="Düzenle">
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteItem(f)}
                            title="Sil"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...data.pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? 'Fakülte Düzenle' : 'Yeni Fakülte'}>
        <form
          onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div className="input-wrapper">
            <label className="input-label">Fakülte Adı</label>
            <input
              {...register('name', { required: 'Zorunlu' })}
              className={`input ${errors.name ? 'error' : ''}`}
              placeholder="Mühendislik Fakültesi"
            />
            {errors.name && <span className="input-error">{errors.name.message}</span>}
          </div>
          <div className="input-wrapper">
            <label className="input-label">Kod</label>
            <input
              {...register('code', { required: 'Zorunlu' })}
              className={`input ${errors.code ? 'error' : ''}`}
              placeholder="MF"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.code && <span className="input-error">{errors.code.message}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || saveMutation.isPending}>
              {isSubmitting || saveMutation.isPending ? <span className="spinner" /> : null}
              {editItem ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteItem}
        title="Fakülte Sil"
        message={`"${deleteItem?.name}" fakültesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
};

export default FacultyList;
