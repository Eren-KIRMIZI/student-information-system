import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserStatus, getRoles, createUser } from '../../api/system.api';
import { PageHeader, FilterBar, TableSkeleton, ErrorState, EmptyState, StatusBadge, ConfirmDialog, Modal } from '../../components/ui/index';
import { Users, UserPlus, Search, Edit2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm as useRHForm } from 'react-hook-form';

const UserList = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState(null);

  // Queries
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', page, search, roleFilter],
    queryFn: () => getUsers({ page, limit: 15, search, role: roleFilter }),
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });

  // Mutations
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, isActive),
    onSuccess: () => {
      toast.success('Kullanıcı durumu güncellendi');
      qc.invalidateQueries({ queryKey: ['users'] });
      setStatusConfirm(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Bir hata oluştu'),
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success('Kullanıcı oluşturuldu');
      qc.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Kullanıcı oluşturulamadı'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useRHForm();

  const handleCreate = (d) => {
    createMutation.mutate(d);
  };

  const roleColor = { ADMIN: 'badge-purple', ACADEMICIAN: 'badge-blue', STUDENT: 'badge-gray' };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Kullanıcı Yönetimi"
        subtitle="Sistemdeki tüm hesapları ve rollerini yönetin"
        action={(
                  <button className="btn btn-primary" onClick={() => { reset(); setIsModalOpen(true); }}>
                    <UserPlus size={16} /> Yeni Kullanıcı
                  </button>
                )}
      />

      <FilterBar>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Kullanıcı ara (email, isim)..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input"
          style={{ width: 160 }}
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tüm Roller</option>
          {roles?.map(r => (
            <option key={r.id} value={r.name}>{r.name}</option>
          ))}
        </select>
      </FilterBar>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.data?.length ? (
          <EmptyState icon={Users} title="Kullanıcı bulunamadı" description="Arama kriterlerine uyan bir hesap yok." />
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>E-Posta</th>
                    <th>Ad Soyad / Bilgi</th>
                    <th>Rol</th>
                    <th style={{ textAlign: 'center' }}>Durum</th>
                    <th style={{ textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.email}</td>
                      <td>
                        {u.student ? `${u.student.firstName} ${u.student.lastName} (Öğrenci)`
                          : u.lecturer ? `${u.lecturer.firstName} ${u.lecturer.lastName} (Akademisyen)`
                          : 'Sistem Yöneticisi'}
                      </td>
                      <td>
                        <span className={`badge ${roleColor[u.role.name] || 'badge-gray'}`}>
                          {u.role.name}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <StatusBadge status={u.isActive ? 'ACTIVE' : 'PASSIVE'} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setStatusConfirm(u)}
                        >
                          <ShieldAlert size={14} />
                          {u.isActive ? 'Pasife Al' : 'Aktifleştir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div style={{ display: 'flex', gap: 10, padding: 16, borderTop: '1px solid var(--color-border)', justifyContent: 'center' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Önceki
                </button>
                <div style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>
                  {page} / {data.pagination.totalPages}
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toggle Status Dialog */}
      <ConfirmDialog
        isOpen={!!statusConfirm}
        onClose={() => setStatusConfirm(null)}
        onConfirm={() => toggleMutation.mutate({ id: statusConfirm.id, isActive: !statusConfirm.isActive })}
        title={statusConfirm?.isActive ? 'Hesabı Pasife Al' : 'Hesabı Aktifleştir'}
        description={
          statusConfirm?.isActive
            ? `${statusConfirm?.email} hesabını pasife almak istediğinize emin misiniz? Kullanıcı sisteme giriş yapamayacak.`
            : `${statusConfirm?.email} hesabını aktifleştirmek istediğinize emin misiniz?`
        }
        confirmText={statusConfirm?.isActive ? 'Evet, Pasife Al' : 'Evet, Aktifleştir'}
        confirmColor={statusConfirm?.isActive ? 'var(--color-danger)' : 'var(--color-primary-600)'}
        isLoading={toggleMutation.isPending}
      />

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Kullanıcı Hesabı (Admin/Manuel)">
        <form onSubmit={handleSubmit(handleCreate)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8, background: 'var(--color-surface-2)', padding: 12, borderRadius: 8 }}>
            Not: Normalde öğrenciler Öğrenci Ekle sayfasından, Akademisyenler Akademisyen ekle sayfasından oluşturulduğunda sistem otomatik kullanıcı hesabı açar. Buradan doğrudan sistem yöneticisi (ADMIN) veya bağımsız hesaplar açabilirsiniz.
          </div>
          
          <div className="input-wrapper">
            <label className="input-label">E-Posta Adresi *</label>
            <input type="email" className={`input ${errors.email ? 'error' : ''}`} {...register('email', { required: true })} />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Şifre *</label>
            <input type="password" className={`input ${errors.password ? 'error' : ''}`} {...register('password', { required: true, minLength: 6 })} />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Rol *</label>
            <select className={`input ${errors.roleId ? 'error' : ''}`} {...register('roleId', { required: true })}>
              <option value="">Seçiniz</option>
              {roles?.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserList;
