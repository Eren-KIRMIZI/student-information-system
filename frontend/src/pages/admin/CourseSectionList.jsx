import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  getCourseSections, createCourseSection, updateCourseSection,
  archiveCourseSection, deleteCourseSection,
} from '../../api/academic.api';
import { getCourses } from '../../api/academic.api';
import { getLecturers } from '../../api/people.api';
import {
  PageHeader, SearchInput, StatusBadge, TableSkeleton,
  EmptyState, ErrorState, Pagination, Modal, ConfirmDialog,
} from '../../components/ui/index';
import { Plus, Pencil, Trash2, Archive, ExternalLink, Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const SEMESTERS = ['FALL', 'SPRING', 'SUMMER'];
const SEM_LABELS = { FALL: 'Güz', SPRING: 'Bahar', SUMMER: 'Yaz' };

const CourseSectionList = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [archiveItem, setArchiveItem] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['course-sections', page, academicYear, semester],
    queryFn: () => getCourseSections({
      page, limit: 20,
      academicYear: academicYear || undefined,
      semester: semester || undefined,
    }),
  });

  const { data: courseData } = useQuery({
    queryKey: ['courses-all'],
    queryFn: () => getCourses({ limit: 500 }),
  });

  const { data: lecturerData } = useQuery({
    queryKey: ['lecturers-all'],
    queryFn: () => getLecturers({ limit: 500 }),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const openAdd = () => { setEditItem(null); reset({}); setFormOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    reset({
      courseId: item.courseId,
      lecturerId: item.lecturerId,
      academicYear: item.academicYear,
      semester: item.semester,
      sectionCode: item.sectionCode,
      quota: item.quota,
      classroom: item.classroom,
    });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (d) => {
      const payload = { ...d, quota: Number(d.quota) };
      return editItem ? updateCourseSection(editItem.id, payload) : createCourseSection(payload);
    },
    onSuccess: () => {
      toast.success(editItem ? 'Şube güncellendi' : 'Şube oluşturuldu');
      qc.invalidateQueries({ queryKey: ['course-sections'] });
      setFormOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'İşlem başarısız'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCourseSection(id),
    onSuccess: () => {
      toast.success('Şube silindi');
      qc.invalidateQueries({ queryKey: ['course-sections'] });
      setDeleteItem(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Silinemedi'),
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => archiveCourseSection(id),
    onSuccess: () => {
      toast.success('Şube arşivlendi');
      qc.invalidateQueries({ queryKey: ['course-sections'] });
      setArchiveItem(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Arşivlenemedi'),
  });

  // Generate a range of academic years (current ± 3)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - 2 + i;
    return `${y}-${y + 1}`;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ders Şubesi Yönetimi"
        subtitle={`Toplam ${data?.pagination?.total ?? 0} şube`}
        action={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Şube Ekle
          </button>
        }
      />

      <div className="filter-bar">
        <select
          className="input"
          style={{ width: 'auto', minWidth: 160 }}
          value={academicYear}
          onChange={(e) => { setAcademicYear(e.target.value); setPage(1); }}
        >
          <option value="">Tüm Dönemler</option>
          {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          className="input"
          style={{ width: 'auto', minWidth: 140 }}
          value={semester}
          onChange={(e) => { setSemester(e.target.value); setPage(1); }}
        >
          <option value="">Tüm Yarıyıllar</option>
          {SEMESTERS.map((s) => <option key={s} value={s}>{SEM_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.data?.length ? (
          <EmptyState
            icon={Layers}
            title="Ders şubesi bulunamadı"
            action={<button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Şube Ekle</button>}
          />
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ders</th>
                    <th>Şube</th>
                    <th>Akademisyen</th>
                    <th>Dönem</th>
                    <th>Kontenjan</th>
                    <th>Durum</th>
                    <th style={{ width: 100 }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((s) => {
                    const remaining = s.remainingQuota ?? (s.quota - (s._count?.enrollments ?? 0));
                    const isFull = remaining <= 0;
                    return (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{s.course?.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.course?.code}</div>
                        </td>
                        <td><span className="badge badge-blue">{s.sectionCode}</span></td>
                        <td style={{ fontSize: 13 }}>
                          {s.lecturer ? `${s.lecturer.firstName} ${s.lecturer.lastName}` : '—'}
                        </td>
                        <td>
                          <div style={{ fontSize: 13 }}>{s.academicYear}</div>
                          <StatusBadge status={s.semester} />
                        </td>
                        <td>
                          <span style={{ color: isFull ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                            {remaining}
                          </span>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}> / {s.quota}</span>
                        </td>
                        <td>
                          {s.isArchived
                            ? <span className="badge badge-gray">Arşiv</span>
                            : <span className="badge badge-green">Aktif</span>
                          }
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => navigate(`/admin/course-sections/${s.id}`)}
                              title="Aç"
                            >
                              <ExternalLink size={14} />
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)} title="Düzenle">
                              <Pencil size={14} />
                            </button>
                            {!s.isArchived && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setArchiveItem(s)}
                                title="Arşivle"
                                style={{ color: 'var(--color-warning)' }}
                              >
                                <Archive size={14} />
                              </button>
                            )}
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDeleteItem(s)}
                              title="Sil"
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination {...data.pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? 'Şube Düzenle' : 'Yeni Şube'} maxWidth={580}>
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-wrapper">
            <label className="input-label">Ders</label>
            <select {...register('courseId', { required: 'Zorunlu' })} className={`input ${errors.courseId ? 'error' : ''}`}>
              <option value="">Ders seçin...</option>
              {courseData?.data?.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
            {errors.courseId && <span className="input-error">{errors.courseId.message}</span>}
          </div>

          <div className="input-wrapper">
            <label className="input-label">Akademisyen</label>
            <select {...register('lecturerId', { required: 'Zorunlu' })} className={`input ${errors.lecturerId ? 'error' : ''}`}>
              <option value="">Akademisyen seçin...</option>
              {lecturerData?.data?.map((l) => (
                <option key={l.id} value={l.id}>{l.title} {l.firstName} {l.lastName}</option>
              ))}
            </select>
            {errors.lecturerId && <span className="input-error">{errors.lecturerId.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-wrapper">
              <label className="input-label">Akademik Yıl</label>
              <select {...register('academicYear', { required: 'Zorunlu' })} className={`input ${errors.academicYear ? 'error' : ''}`}>
                <option value="">Seçin...</option>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.academicYear && <span className="input-error">{errors.academicYear.message}</span>}
            </div>
            <div className="input-wrapper">
              <label className="input-label">Yarıyıl</label>
              <select {...register('semester', { required: 'Zorunlu' })} className={`input ${errors.semester ? 'error' : ''}`}>
                <option value="">Seçin...</option>
                {SEMESTERS.map((s) => <option key={s} value={s}>{SEM_LABELS[s]}</option>)}
              </select>
              {errors.semester && <span className="input-error">{errors.semester.message}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-wrapper">
              <label className="input-label">Şube Kodu</label>
              <input
                {...register('sectionCode', { required: 'Zorunlu' })}
                className={`input ${errors.sectionCode ? 'error' : ''}`}
                placeholder="A"
              />
              {errors.sectionCode && <span className="input-error">{errors.sectionCode.message}</span>}
            </div>
            <div className="input-wrapper">
              <label className="input-label">Kontenjan</label>
              <input
                type="number"
                min={1}
                {...register('quota', { required: 'Zorunlu', min: 1 })}
                className={`input ${errors.quota ? 'error' : ''}`}
                placeholder="30"
              />
              {errors.quota && <span className="input-error">{errors.quota.message}</span>}
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Derslik (opsiyonel)</label>
            <input
              {...register('classroom')}
              className="input"
              placeholder="D-101"
            />
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

      {/* Archive Confirm */}
      <ConfirmDialog
        open={!!archiveItem}
        title="Şubeyi Arşivle"
        message={`"${archiveItem?.sectionCode}" şubesini arşivlemek istediğinizden emin misiniz? Arşivlenen şubeye yeni kayıt yapılamaz.`}
        onConfirm={() => archiveMutation.mutate(archiveItem.id)}
        onCancel={() => setArchiveItem(null)}
        danger={false}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteItem}
        title="Şube Sil"
        message={`"${deleteItem?.sectionCode}" şubesini silmek istediğinizden emin misiniz? Aktif kayıtları olan şubeler silinemez.`}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
};

export default CourseSectionList;
