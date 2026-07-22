import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, updateRole } from '../../api/system.api';
import { PageHeader, TableSkeleton, ErrorState, EmptyState, Modal } from '../../components/ui/index';
import { Shield, ShieldAlert, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const RoleList = () => {
  const qc = useQueryClient();
  const [editingRole, setEditingRole] = useState(null);

  const {
    data: roles,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });

  const { register, handleSubmit, reset } = useForm();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRole(id, data),
    onSuccess: () => {
      toast.success('Rol güncellendi');
      qc.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Rol güncellenemedi'),
  });

  const handleEdit = (role) => {
    reset({ name: role.name, description: role.description || '' });
    setEditingRole(role);
  };

  const onSubmit = (data) => {
    updateMutation.mutate({ id: editingRole.id, data });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Rol Yönetimi" subtitle="Sistemde tanımlı yetki grupları (Roller kritik yapıtaşlarıdır)" />

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <TableSkeleton rows={4} cols={3} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !roles?.length ? (
          <EmptyState icon={Shield} title="Rol bulunamadı" />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Rol Adı</th>
                  <th>Açıklama / Yetki Özeti</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldAlert
                          size={16}
                          color={r.name === 'ADMIN' ? '#7c3aed' : r.name === 'ACADEMICIAN' ? '#2563eb' : '#94a3b8'}
                        />
                        <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{r.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>
                      {r.description || 'Açıklama belirtilmemiş'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(r)}>
                        <Edit2 size={14} /> Düzenle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!editingRole} onClose={() => setEditingRole(null)} title="Rol Düzenle">
        {editingRole && (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-wrapper">
              <label className="input-label">Rol Adı (Kritik)</label>
              <input
                type="text"
                className="input"
                {...register('name')}
                readOnly
                style={{ opacity: 0.7 }}
                title="Sistem rol adları değiştirilemez"
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Açıklama</label>
              <textarea
                className="input"
                rows={3}
                {...register('description')}
                placeholder="Rol hakkında açıklayıcı bilgi"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingRole(null)}>
                İptal
              </button>
              <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default RoleList;
