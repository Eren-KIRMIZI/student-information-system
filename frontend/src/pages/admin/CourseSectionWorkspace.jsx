import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseSection } from '../../api/academic.api';
import {
  getSectionWeeklySchedule, createWeeklySlot, deleteWeeklySlot,
  getSectionExamSchedule, createExamSlot, deleteExamSlot,
} from '../../api/system.api';
import { getEnrollments } from '../../api/records.api';
import {
  PageHeader, StatusBadge, Skeleton, ErrorState, Tabs,
  Modal, ConfirmDialog, EmptyState,
} from '../../components/ui/index';
import {
  ArrowLeft, Calendar, ClipboardList, Users, Clock,
  Plus, Trash2, Info,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABELS = { MONDAY: 'Pzt', TUESDAY: 'Sal', WEDNESDAY: 'Çar', THURSDAY: 'Per', FRIDAY: 'Cum', SATURDAY: 'Cmt' };
const EXAM_TYPES = ['MIDTERM', 'FINAL', 'MAKEUP'];
const EXAM_LABELS = { MIDTERM: 'Vize', FINAL: 'Final', MAKEUP: 'Bütünleme' };

// ===== General Info Tab =====
const GeneralTab = ({ section }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
    {[
      ['Ders', `${section.course?.code} — ${section.course?.name}`],
      ['Şube Kodu', section.sectionCode],
      ['Akademisyen', section.lecturer ? `${section.lecturer.firstName} ${section.lecturer.lastName}` : '—'],
      ['Akademik Yıl', section.academicYear],
      ['Yarıyıl', section.semester],
      ['Kontenjan', `${(section.quota - (section.remainingQuota ?? 0))} / ${section.quota} (${section.remainingQuota ?? 0} boş)`],
      ['Derslik', section.classroom || '—'],
      ['Bölüm', section.course?.department?.name || '—'],
    ].map(([label, value]) => (
      <div key={label} style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{value}</div>
      </div>
    ))}
  </div>
);

// ===== Weekly Schedule Tab (Admin CRUD) =====
const WeeklyScheduleTab = ({ sectionId }) => {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['weekly-schedule', sectionId],
    queryFn: () => getSectionWeeklySchedule(sectionId),
  });

  const addMutation = useMutation({
    mutationFn: (d) => createWeeklySlot(sectionId, d),
    onSuccess: () => {
      toast.success('Program slotu eklendi');
      qc.invalidateQueries({ queryKey: ['weekly-schedule', sectionId] });
      setAddOpen(false); reset({});
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Eklenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteWeeklySlot(id),
    onSuccess: () => {
      toast.success('Slot silindi');
      qc.invalidateQueries({ queryKey: ['weekly-schedule', sectionId] });
      setDeleteItem(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Silinemedi'),
  });

  if (isLoading) return <Skeleton height={200} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={() => { reset({}); setAddOpen(true); }}>
          <Plus size={14} /> Slot Ekle
        </button>
      </div>
      {!slots.length ? (
        <EmptyState icon={Clock} title="Haftalık program slotu yok" />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Gün</th><th>Başlangıç</th><th>Bitiş</th><th>Derslik</th><th style={{ width: 60 }}></th></tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id}>
                  <td><span className="badge badge-blue">{DAY_LABELS[s.dayOfWeek]}</span></td>
                  <td>{s.startTime}</td>
                  <td>{s.endTime}</td>
                  <td>{s.classroom || '—'}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteItem(s)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Program Slotu Ekle" maxWidth={420}>
        <form onSubmit={handleSubmit((d) => addMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-wrapper">
            <label className="input-label">Gün</label>
            <select {...register('dayOfWeek', { required: 'Zorunlu' })} className={`input ${errors.dayOfWeek ? 'error' : ''}`}>
              <option value="">Seçin...</option>
              {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
            </select>
            {errors.dayOfWeek && <span className="input-error">{errors.dayOfWeek.message}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-wrapper">
              <label className="input-label">Başlangıç (HH:MM)</label>
              <input {...register('startTime', { required: 'Zorunlu', pattern: { value: /^\d{2}:\d{2}$/, message: 'HH:MM formatı' } })} className={`input ${errors.startTime ? 'error' : ''}`} placeholder="09:00" />
              {errors.startTime && <span className="input-error">{errors.startTime.message}</span>}
            </div>
            <div className="input-wrapper">
              <label className="input-label">Bitiş (HH:MM)</label>
              <input {...register('endTime', { required: 'Zorunlu', pattern: { value: /^\d{2}:\d{2}$/, message: 'HH:MM formatı' } })} className={`input ${errors.endTime ? 'error' : ''}`} placeholder="11:00" />
              {errors.endTime && <span className="input-error">{errors.endTime.message}</span>}
            </div>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Derslik (opsiyonel)</label>
            <input {...register('classroom')} className="input" placeholder="D-201" />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={addMutation.isPending}>
              {addMutation.isPending ? <span className="spinner" /> : null} Ekle
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        title="Slot Sil"
        message={`${DAY_LABELS[deleteItem?.dayOfWeek]} ${deleteItem?.startTime}–${deleteItem?.endTime} slotunu silmek istediğinizden emin misiniz?`}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
};

// ===== Exam Schedule Tab =====
const ExamScheduleTab = ({ sectionId }) => {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exam-schedule', sectionId],
    queryFn: () => getSectionExamSchedule(sectionId),
  });

  const addMutation = useMutation({
    mutationFn: (d) => createExamSlot(sectionId, { ...d, duration: Number(d.duration) }),
    onSuccess: () => {
      toast.success('Sınav eklendi');
      qc.invalidateQueries({ queryKey: ['exam-schedule', sectionId] });
      setAddOpen(false); reset({});
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Eklenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteExamSlot(id),
    onSuccess: () => {
      toast.success('Sınav silindi');
      qc.invalidateQueries({ queryKey: ['exam-schedule', sectionId] });
      setDeleteItem(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Silinemedi'),
  });

  if (isLoading) return <Skeleton height={200} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={() => { reset({}); setAddOpen(true); }}>
          <Plus size={14} /> Sınav Ekle
        </button>
      </div>
      {!exams.length ? (
        <EmptyState icon={Calendar} title="Sınav programı eklenmemiş" />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Tür</th><th>Tarih</th><th>Saat</th><th>Süre</th><th>Salon</th><th style={{ width: 60 }}></th></tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id}>
                  <td><StatusBadge status={e.examType} /></td>
                  <td>{dayjs(e.examDate).format('DD.MM.YYYY')}</td>
                  <td>{e.startTime}</td>
                  <td>{e.duration} dk</td>
                  <td>{e.classroom || '—'}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteItem(e)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Sınav Ekle" maxWidth={440}>
        <form onSubmit={handleSubmit((d) => addMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-wrapper">
            <label className="input-label">Sınav Türü</label>
            <select {...register('examType', { required: 'Zorunlu' })} className={`input ${errors.examType ? 'error' : ''}`}>
              <option value="">Seçin...</option>
              {EXAM_TYPES.map((t) => <option key={t} value={t}>{EXAM_LABELS[t]}</option>)}
            </select>
            {errors.examType && <span className="input-error">{errors.examType.message}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-wrapper">
              <label className="input-label">Tarih</label>
              <input type="date" {...register('examDate', { required: 'Zorunlu' })} className={`input ${errors.examDate ? 'error' : ''}`} />
              {errors.examDate && <span className="input-error">{errors.examDate.message}</span>}
            </div>
            <div className="input-wrapper">
              <label className="input-label">Saat (HH:MM)</label>
              <input {...register('startTime', { required: 'Zorunlu' })} className={`input ${errors.startTime ? 'error' : ''}`} placeholder="09:00" />
              {errors.startTime && <span className="input-error">{errors.startTime.message}</span>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-wrapper">
              <label className="input-label">Süre (dk)</label>
              <input type="number" min={30} {...register('duration', { required: 'Zorunlu' })} className={`input ${errors.duration ? 'error' : ''}`} placeholder="90" />
              {errors.duration && <span className="input-error">{errors.duration.message}</span>}
            </div>
            <div className="input-wrapper">
              <label className="input-label">Salon</label>
              <input {...register('classroom')} className="input" placeholder="A-101" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={addMutation.isPending}>
              {addMutation.isPending ? <span className="spinner" /> : null} Ekle
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        title="Sınav Sil"
        message={`${EXAM_LABELS[deleteItem?.examType] ?? ''} sınavını silmek istediğinizden emin misiniz?`}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
};

// ===== Enrolled Students Tab =====
const EnrolledStudentsTab = ({ sectionId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['section-enrollments', sectionId],
    queryFn: () => getEnrollments({ courseSectionId: sectionId, limit: 100 }),
  });

  if (isLoading) return <Skeleton height={200} />;
  const enrollments = data?.data ?? [];

  return (
    <div>
      {!enrollments.length ? (
        <EmptyState icon={Users} title="Kayıtlı öğrenci bulunmuyor" />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Öğrenci</th><th>Numara</th><th>Durum</th><th>Kayıt Tarihi</th></tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.student?.firstName} {e.student?.lastName}</div>
                  </td>
                  <td><span className="badge badge-gray">{e.student?.studentNumber}</span></td>
                  <td><StatusBadge status={e.status} /></td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {dayjs(e.createdAt).format('DD.MM.YYYY')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ===== Main Component =====
const AdminCourseSectionWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  const { data: section, isLoading, isError, refetch } = useQuery({
    queryKey: ['course-section', id],
    queryFn: () => getCourseSection(id),
  });

  const TABS = [
    { id: 'general', label: 'Genel Bilgi', icon: Info },
    { id: 'schedule', label: 'Haftalık Program', icon: Clock },
    { id: 'exams', label: 'Sınav Programı', icon: Calendar },
    { id: 'students', label: 'Kayıtlı Öğrenciler', icon: Users },
  ];

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Ders Şubesi" />
        <div className="card"><Skeleton height={300} /></div>
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${section.course?.code} — ${section.sectionCode}`}
        subtitle={`${section.course?.name} · ${section.academicYear} ${section.semester}`}
        action={
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Geri
          </button>
        }
      />

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--color-border)' }}>
          <Tabs tabs={TABS.map((t) => ({ id: t.id, label: t.label }))} active={activeTab} onChange={setActiveTab} />
        </div>
        <div style={{ padding: 24 }}>
          {activeTab === 'general' && <GeneralTab section={section} />}
          {activeTab === 'schedule' && <WeeklyScheduleTab sectionId={id} />}
          {activeTab === 'exams' && <ExamScheduleTab sectionId={id} />}
          {activeTab === 'students' && <EnrolledStudentsTab sectionId={id} />}
        </div>
      </div>
    </div>
  );
};

export default AdminCourseSectionWorkspace;
