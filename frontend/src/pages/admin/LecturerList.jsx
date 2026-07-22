import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getLecturers, createLecturer, updateLecturerStatus } from '../../api/people.api';
import { getDepartments } from '../../api/academic.api';
import {
  PageHeader, SearchInput, StatusBadge, TableSkeleton,
  EmptyState, ErrorState, Pagination, Modal,
} from '../../components/ui/index';
import { PersonRow } from '../../components/feature/index';
import { LECTURER_TITLES } from '../../utils/constants';
import { Plus, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const LecturerList = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['lecturers', page, search, deptFilter],
    queryFn: () => getLecturers({
      page, limit: 20, search,
      departmentId: deptFilter || undefined,
    }),
  });

  const { data: deptData } = useQuery({
    queryKey: ['departments-all'],
    queryFn: () => getDepartments({ limit: 200 }),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const createMutation = useMutation({
    mutationFn: (d) => createLecturer(d),
    onSuccess: () => {
      toast.success('Akademisyen oluşturuldu');
      qc.invalidateQueries({ queryKey: ['lecturers'] });
      setFormOpen(false);
      reset({});
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Oluşturulamadı'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateLecturerStatus(id, isActive),
    onSuccess: (_, vars) => {
      toast.success(`Akademisyen ${vars.isActive ? 'aktif' : 'pasif'} edildi`);
      qc.invalidateQueries({ queryKey: ['lecturers'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Güncelleme başarısız'),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Akademisyen Yönetimi"
        subtitle={`Toplam ${data?.pagination?.total ?? 0} akademisyen`}
        action={
          <button className="btn btn-primary" onClick={() => { reset({}); setFormOpen(true); }}>
            <Plus size={16} /> Akademisyen Ekle
          </button>
        }
      />

      <div className="filter-bar">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Ad, soyad veya ünvan ara..." />
        <select
          className="input"
          style={{ width: 'auto', minWidth: 180 }}
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
          <TableSkeleton rows={8} cols={5} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.data?.length ? (
          <EmptyState
            icon={Users}
            title="Akademisyen bulunamadı"
            action={<button className="btn btn-primary" onClick={() => { reset({}); setFormOpen(true); }}><Plus size={15} /> Akademisyen Ekle</button>}
          />
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Akademisyen</th>
                    <th>Ünvan</th>
                    <th>Bölüm</th>
                    <th>Telefon</th>
                    <th>Durum</th>
                    <th style={{ width: 100 }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <PersonRow
                          firstName={l.firstName}
                          lastName={l.lastName}
                          email={l.user?.email}
                          subtitle={l.user?.email}
                        />
                      </td>
                      <td><span className="badge badge-blue">{l.title ?? '—'}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {l.department?.name ?? '—'}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {l.phone ?? '—'}
                      </td>
                      <td><StatusBadge status={l.user?.isActive} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate(`/admin/lecturers/${l.id}`)}
                            title="Detay"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => statusMutation.mutate({ id: l.id, isActive: !l.user?.isActive })}
                            title={l.user?.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                            style={{ color: l.user?.isActive ? 'var(--color-warning)' : 'var(--color-success)' }}
                          >
                            {l.user?.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
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

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Yeni Akademisyen" maxWidth={600}>
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="input-wrapper">
              <label className="input-label">Ad</label>
              <input {...register('firstName', { required: 'Zorunlu' })} className={`input ${errors.firstName ? 'error' : ''}`} placeholder="Ayşe" />
              {errors.firstName && <span className="input-error">{errors.firstName.message}</span>}
            </div>
            <div className="input-wrapper">
              <label className="input-label">Soyad</label>
              <input {...register('lastName', { required: 'Zorunlu' })} className={`input ${errors.lastName ? 'error' : ''}`} placeholder="Demir" />
              {errors.lastName && <span className="input-error">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="input-wrapper">
              <label className="input-label">E-posta</label>
              <input type="email" {...register('email', { required: 'Zorunlu' })} className={`input ${errors.email ? 'error' : ''}`} placeholder="ayse@uni.edu.tr" />
              {errors.email && <span className="input-error">{errors.email.message}</span>}
            </div>
            <div className="input-wrapper">
              <label className="input-label">Şifre</label>
              <input type="password" {...register('password', { required: 'Zorunlu', minLength: { value: 8, message: 'En az 8 karakter' } })} className={`input ${errors.password ? 'error' : ''}`} placeholder="••••••••" />
              {errors.password && <span className="input-error">{errors.password.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="input-wrapper">
              <label className="input-label">Ünvan</label>
              <select {...register('title')} className="input">
                <option value="">Seçin (opsiyonel)</option>
                {LECTURER_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-wrapper">
              <label className="input-label">Telefon</label>
              <input {...register('phone')} className="input" placeholder="+90 555 000 0000" />
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Bölüm</label>
            <select {...register('departmentId', { required: 'Zorunlu' })} className={`input ${errors.departmentId ? 'error' : ''}`}>
              <option value="">Bölüm seçin...</option>
              {deptData?.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {errors.departmentId && <span className="input-error">{errors.departmentId.message}</span>}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || createMutation.isPending}>
              {(isSubmitting || createMutation.isPending) ? <span className="spinner" /> : null}
              Oluştur
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LecturerList;
