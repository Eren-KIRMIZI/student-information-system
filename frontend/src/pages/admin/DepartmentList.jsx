import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
} from '../../api/academic.api';
import { getFaculties } from '../../api/academic.api';
import {
  PageHeader, SearchInput, StatusBadge, TableSkeleton,
  EmptyState, ErrorState, Pagination, Modal, ConfirmDialog,
} from '../../components/ui/index';
import { Plus, Pencil, Trash2, Building } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const DepartmentList = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['departments', page, search, facultyFilter],
    queryFn: () => getDepartments({ page, limit: 20, search, facultyId: facultyFilter || undefined }),
  });

  const { data: facultyData } = useQuery({
    queryKey: ['faculties-all'],
    queryFn: () => getFaculties({ limit: 100 }),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const openAdd = () => { setEditItem(null); reset({}); setFormOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    reset({ name: item.name, code: item.code, facultyId: item.facultyId });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? updateDepartment(editItem.id, d) : createDepartment(d),
    onSuccess: () => {
      toast.success(editItem ? 'Bölüm güncellendi' : 'Bölüm oluşturuldu');
      qc.invalidateQueries({ queryKey: ['departments'] });
      setFormOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'İşlem başarısız'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDepartment(id),
    onSuccess: () => {
      toast.success('Bölüm silindi');
      qc.invalidateQueries({ queryKey: ['departments'] });
      setDeleteItem(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Silinemedi'),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bölüm Yönetimi"
        subtitle={`Toplam ${data?.pagination?.total ?? 0} bölüm`}
        action={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Bölüm Ekle
          </button>
        }
      />

      <div className="filter-bar">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Bölüm ara..." />
        <select
          className="input"
          style={{ width: 'auto', minWidth: 180 }}
          value={facultyFilter}
          onChange={(e) => { setFacultyFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tüm Fakülteler</option>
          {facultyData?.data?.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.data?.length ? (
          <EmptyState
            icon={Building}
            title="Bölüm bulunamadı"
            action={<button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Bölüm Ekle</button>}
          />
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Bölüm Adı</th>
                    <th>Kod</th>
                    <th>Fakülte</th>
                    <th>İstatistik</th>
                    <th style={{ width: 80 }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td><span className="badge badge-blue">{d.code}</span></td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                        {d.faculty?.name ?? '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
                          <span>{d._count?.students ?? 0} öğrenci</span>
                          <span>·</span>
                          <span>{d._count?.lecturers ?? 0} akademisyen</span>
                          <span>·</span>
                          <span>{d._count?.courses ?? 0} ders</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)} title="Düzenle">
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteItem(d)}
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
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? 'Bölüm Düzenle' : 'Yeni Bölüm'}>
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-wrapper">
            <label className="input-label">Bölüm Adı</label>
            <input
              {...register('name', { required: 'Zorunlu' })}
              className={`input ${errors.name ? 'error' : ''}`}
              placeholder="Bilgisayar Mühendisliği"
            />
            {errors.name && <span className="input-error">{errors.name.message}</span>}
          </div>
          <div className="input-wrapper">
            <label className="input-label">Kod</label>
            <input
              {...register('code', { required: 'Zorunlu' })}
              className={`input ${errors.code ? 'error' : ''}`}
              placeholder="BM"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.code && <span className="input-error">{errors.code.message}</span>}
          </div>
          <div className="input-wrapper">
            <label className="input-label">Fakülte</label>
            <select {...register('facultyId', { required: 'Zorunlu' })} className={`input ${errors.facultyId ? 'error' : ''}`}>
              <option value="">Fakülte seçin...</option>
              {facultyData?.data?.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {errors.facultyId && <span className="input-error">{errors.facultyId.message}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || saveMutation.isPending}>
              {(isSubmitting || saveMutation.isPending) ? <span className="spinner" /> : null}
              {editItem ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteItem}
        title="Bölüm Sil"
        message={`"${deleteItem?.name}" bölümünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
};

export default DepartmentList;
