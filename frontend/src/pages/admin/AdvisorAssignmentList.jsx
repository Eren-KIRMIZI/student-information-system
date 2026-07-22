import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdvisorAssignments, createAdvisorAssignment, deactivateAdvisorAssignment } from '../../api/system.api';
import { getStudents } from '../../api/people.api';
import { getLecturers } from '../../api/people.api';
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
import { Plus, UserCheck, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const AdvisorAssignmentList = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [deactivateItem, setDeactivateItem] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['advisor-assignments', page],
    queryFn: () => getAdvisorAssignments({ page, limit: 20 }),
  });

  const { data: studentData } = useQuery({
    queryKey: ['students-all'],
    queryFn: () => getStudents({ limit: 500 }),
  });

  const { data: lecturerData } = useQuery({
    queryKey: ['lecturers-all'],
    queryFn: () => getLecturers({ limit: 500 }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const createMutation = useMutation({
    mutationFn: (d) => createAdvisorAssignment(d),
    onSuccess: () => {
      toast.success('Danışman ataması yapıldı');
      qc.invalidateQueries({ queryKey: ['advisor-assignments'] });
      setFormOpen(false);
      reset({});
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Atanamadı'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => deactivateAdvisorAssignment(id),
    onSuccess: () => {
      toast.success('Atama pasif edildi');
      qc.invalidateQueries({ queryKey: ['advisor-assignments'] });
      setDeactivateItem(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'İşlem başarısız'),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Danışman Atamaları"
        subtitle={`Toplam ${data?.pagination?.total ?? 0} atama`}
        action={
          <button
            className="btn btn-primary"
            onClick={() => {
              reset({});
              setFormOpen(true);
            }}
          >
            <Plus size={16} /> Atama Yap
          </button>
        }
      />

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.data?.length ? (
          <EmptyState
            icon={UserCheck}
            title="Danışman ataması bulunamadı"
            action={
              <button
                className="btn btn-primary"
                onClick={() => {
                  reset({});
                  setFormOpen(true);
                }}
              >
                <Plus size={15} /> Atama Yap
              </button>
            }
          />
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Öğrenci</th>
                    <th>Danışman</th>
                    <th>Atama Tarihi</th>
                    <th>Durum</th>
                    <th style={{ width: 80 }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {a.student?.firstName} {a.student?.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{a.student?.studentNumber}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {a.lecturer?.firstName} {a.lecturer?.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{a.lecturer?.title}</div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {dayjs(a.assignedAt).format('DD.MM.YYYY')}
                      </td>
                      <td>
                        {a.isActive ? (
                          <span className="badge badge-green">Aktif</span>
                        ) : (
                          <span className="badge badge-gray">Pasif</span>
                        )}
                      </td>
                      <td>
                        {a.isActive && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeactivateItem(a)}
                            title="Pasif Et"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <XCircle size={14} />
                          </button>
                        )}
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

      {/* Create Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Danışman Ataması Yap" maxWidth={500}>
        <form
          onSubmit={handleSubmit((d) => createMutation.mutate(d))}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div className="input-wrapper">
            <label className="input-label">Öğrenci</label>
            <select
              {...register('studentId', { required: 'Zorunlu' })}
              className={`input ${errors.studentId ? 'error' : ''}`}
            >
              <option value="">Öğrenci seçin...</option>
              {studentData?.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.studentNumber})
                </option>
              ))}
            </select>
            {errors.studentId && <span className="input-error">{errors.studentId.message}</span>}
          </div>
          <div className="input-wrapper">
            <label className="input-label">Danışman</label>
            <select
              {...register('lecturerId', { required: 'Zorunlu' })}
              className={`input ${errors.lecturerId ? 'error' : ''}`}
            >
              <option value="">Akademisyen seçin...</option>
              {lecturerData?.data?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} {l.firstName} {l.lastName}
                </option>
              ))}
            </select>
            {errors.lecturerId && <span className="input-error">{errors.lecturerId.message}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || createMutation.isPending}>
              {isSubmitting || createMutation.isPending ? <span className="spinner" /> : null}
              Atama Yap
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirm */}
      <ConfirmDialog
        open={!!deactivateItem}
        title="Atamayı Pasif Et"
        message={`${deactivateItem?.student?.firstName} ${deactivateItem?.student?.lastName} — ${deactivateItem?.lecturer?.firstName} ${deactivateItem?.lecturer?.lastName} atamasını pasif etmek istediğinizden emin misiniz?`}
        onConfirm={() => deactivateMutation.mutate(deactivateItem.id)}
        onCancel={() => setDeactivateItem(null)}
      />
    </div>
  );
};

export default AdvisorAssignmentList;
