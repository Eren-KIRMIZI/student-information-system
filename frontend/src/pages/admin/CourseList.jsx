import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCourses, createCourse, updateCourse, deleteCourse,
} from '../../api/academic.api';
import { getDepartments } from '../../api/academic.api';
import {
  PageHeader, SearchInput, TableSkeleton,
  EmptyState, ErrorState, Pagination, Modal, ConfirmDialog,
} from '../../components/ui/index';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const CourseList = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['courses', page, search, deptFilter],
    queryFn: () => getCourses({ page, limit: 20, search, departmentId: deptFilter || undefined }),
  });

  const { data: deptData } = useQuery({
    queryKey: ['departments-all'],
    queryFn: () => getDepartments({ limit: 200 }),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const openAdd = () => { setEditItem(null); reset({}); setFormOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    reset({
      code: item.code,
      name: item.name,
      credits: item.credits,
      ects: item.ects,
      semester: item.semester,
      departmentId: item.departmentId,
    });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (d) => {
      const payload = { ...d, credits: Number(d.credits), ects: Number(d.ects) };
      return editItem ? updateCourse(editItem.id, payload) : createCourse(payload);
    },
    onSuccess: () => {
      toast.success(editItem ? 'Ders güncellendi' : 'Ders oluşturuldu');
      qc.invalidateQueries({ queryKey: ['courses'] });
      setFormOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'İşlem başarısız'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCourse(id),
    onSuccess: () => {
      toast.success('Ders silindi');
      qc.invalidateQueries({ queryKey: ['courses'] });
      setDeleteItem(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Silinemedi'),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ders Yönetimi"
        subtitle={`Toplam ${data?.pagination?.total ?? 0} ders`}
        action={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Ders Ekle
          </button>
        }
      />

      <div className="filter-bar">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Ders ara..." />
        <select
          className="input"
          style={{ width: 'auto', minWidth: 200 }}
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tüm Bölümler</option>
          {deptData?.data?.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.data?.length ? (
          <EmptyState
            icon={BookOpen}
            title="Ders bulunamadı"
            action={<button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Ders Ekle</button>}
          />
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ders Adı</th>
                    <th>Kod</th>
                    <th>Bölüm</th>
                    <th>Kredi</th>
                    <th>AKTS</th>
                    <th>Şube</th>
                    <th style={{ width: 80 }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td><span className="badge badge-blue">{c.code}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {c.department?.name ?? '—'}
                      </td>
                      <td>{c.credits}</td>
                      <td>{c.ects}</td>
                      <td>
                        <span className="badge badge-gray">{c._count?.sections ?? 0} şube</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)} title="Düzenle">
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteItem(c)}
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
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? 'Ders Düzenle' : 'Yeni Ders'} maxWidth={560}>
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-wrapper">
              <label className="input-label">Ders Adı</label>
              <input
                {...register('name', { required: 'Zorunlu' })}
                className={`input ${errors.name ? 'error' : ''}`}
                placeholder="Algoritma ve Programlama"
              />
              {errors.name && <span className="input-error">{errors.name.message}</span>}
            </div>
            <div className="input-wrapper">
              <label className="input-label">Ders Kodu</label>
              <input
                {...register('code', { required: 'Zorunlu' })}
                className={`input ${errors.code ? 'error' : ''}`}
                placeholder="BM101"
                style={{ textTransform: 'uppercase' }}
              />
              {errors.code && <span className="input-error">{errors.code.message}</span>}
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Bölüm</label>
            <select {...register('departmentId', { required: 'Zorunlu' })} className={`input ${errors.departmentId ? 'error' : ''}`}>
              <option value="">Bölüm seçin...</option>
              {deptData?.data?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.departmentId && <span className="input-error">{errors.departmentId.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-wrapper">
              <label className="input-label">Kredi</label>
              <input
                type="number"
                min={1} max={10}
                {...register('credits', { required: 'Zorunlu', min: 1 })}
                className={`input ${errors.credits ? 'error' : ''}`}
                placeholder="3"
              />
              {errors.credits && <span className="input-error">{errors.credits.message}</span>}
            </div>
            <div className="input-wrapper">
              <label className="input-label">AKTS</label>
              <input
                type="number"
                min={1} max={30}
                {...register('ects', { required: 'Zorunlu', min: 1 })}
                className={`input ${errors.ects ? 'error' : ''}`}
                placeholder="5"
              />
              {errors.ects && <span className="input-error">{errors.ects.message}</span>}
            </div>
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
        title="Ders Sil"
        message={`"${deleteItem?.name}" dersini silmek istediğinizden emin misiniz? Açık şubesi olan dersler silinemez.`}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
};

export default CourseList;
