import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseSection } from '../../api/academic.api';
import { getSectionGrades, updateGrade, finalizeGrade } from '../../api/records.api';
import { getSectionAttendance, createAttendance } from '../../api/records.api';
import { getSectionWeeklySchedule } from '../../api/system.api';
import { getSectionExamSchedule } from '../../api/system.api';
import { getSectionMaterials, uploadFile, deleteUpload } from '../../api/system.api';
import {
  PageHeader, StatusBadge, Skeleton, ErrorState, Tabs,
  EmptyState,
} from '../../components/ui/index';
import {
  ArrowLeft, BookOpen, ClipboardCheck, Calendar, Clock,
  FileText, Upload, Trash2, Check, Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const DAY_LABELS = { MONDAY: 'Pazartesi', TUESDAY: 'Salı', WEDNESDAY: 'Çarşamba', THURSDAY: 'Perşembe', FRIDAY: 'Cuma', SATURDAY: 'Cumartesi' };
const EXAM_LABELS = { MIDTERM: 'Vize', FINAL: 'Final', MAKEUP: 'Bütünleme' };
const LETTER_GRADES = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF', 'NA'];
const ATT_STATUSES = ['PRESENT', 'ABSENT', 'EXCUSED'];
const ATT_LABELS = { PRESENT: 'Katıldı', ABSENT: 'Devamsız', EXCUSED: 'İzinli' };

// ===== Grade Entry Tab =====
const GradeEntryTab = ({ sectionId }) => {
  const qc = useQueryClient();
  const [localGrades, setLocalGrades] = useState({});

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['section-grades', sectionId],
    queryFn: () => getSectionGrades(sectionId),
  });

  const updateMutation = useMutation({
    mutationFn: ({ enrollmentId, grade }) => updateGrade(enrollmentId, grade),
    onSuccess: () => {
      toast.success('Not kaydedildi');
      qc.invalidateQueries({ queryKey: ['section-grades', sectionId] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Kaydedilemedi'),
  });

  const finalizeMutation = useMutation({
    mutationFn: (enrollmentId) => finalizeGrade(enrollmentId),
    onSuccess: () => {
      toast.success('Not kesinleştirildi');
      qc.invalidateQueries({ queryKey: ['section-grades', sectionId] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Kesinleştirilemedi'),
  });

  if (isLoading) return <Skeleton height={250} />;
  if (isError) return <ErrorState onRetry={refetch} />;
  const enrollments = data?.data ?? [];
  if (!enrollments.length) return <EmptyState icon={BookOpen} title="Kayıtlı öğrenci bulunmuyor" />;

  return (
    <div>
      <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
        Not girişi yapıp "Kaydet"e tıklayın. Kesinleştirilen notlar düzenlenemez.
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Öğrenci</th>
              <th>Puan (0-100)</th>
              <th>Harf Notu</th>
              <th>Durum</th>
              <th style={{ width: 140 }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => {
              const grade = e.grade;
              const isFinalized = grade?.isFinalized;
              const localVal = localGrades[e.id] ?? {};

              return (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.student?.firstName} {e.student?.lastName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{e.student?.studentNumber}</div>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0} max={100}
                      disabled={isFinalized}
                      defaultValue={grade?.score ?? ''}
                      onChange={(ev) => setLocalGrades((prev) => ({ ...prev, [e.id]: { ...prev[e.id], score: Number(ev.target.value) } }))}
                      className="input"
                      style={{ width: 80, padding: '4px 8px', fontSize: 13 }}
                    />
                  </td>
                  <td>
                    <select
                      disabled={isFinalized}
                      defaultValue={grade?.letterGrade ?? ''}
                      onChange={(ev) => setLocalGrades((prev) => ({ ...prev, [e.id]: { ...prev[e.id], letterGrade: ev.target.value } }))}
                      className="input"
                      style={{ width: 90, padding: '4px 8px', fontSize: 13 }}
                    >
                      <option value="">—</option>
                      {LETTER_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </td>
                  <td>
                    {isFinalized
                      ? <span className="badge badge-green">Kesinleşti</span>
                      : grade
                        ? <span className="badge badge-yellow">Taslak</span>
                        : <span className="badge badge-gray">Girilmedi</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!isFinalized && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => updateMutation.mutate({ enrollmentId: e.id, grade: localVal })}
                          disabled={updateMutation.isPending}
                          title="Kaydet"
                        >
                          <Check size={13} /> Kaydet
                        </button>
                      )}
                      {!isFinalized && grade && (
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--color-danger)', color: '#fff' }}
                          onClick={() => finalizeMutation.mutate(e.id)}
                          disabled={finalizeMutation.isPending}
                          title="Kesinleştir"
                        >
                          <Lock size={13} /> Kesinleştir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===== Attendance Tab =====
const AttendanceTab = ({ sectionId }) => {
  const qc = useQueryClient();
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [statuses, setStatuses] = useState({});

  const { data: gradesData, isLoading: gLoading } = useQuery({
    queryKey: ['section-grades', sectionId],
    queryFn: () => getSectionGrades(sectionId),
  });

  const { data: attData, isLoading: aLoading, refetch } = useQuery({
    queryKey: ['section-attendance', sectionId, date],
    queryFn: () => getSectionAttendance(sectionId, { date }),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const enrollments = gradesData?.data ?? [];
      const records = enrollments.map((e) => ({
        enrollmentId: e.id,
        status: statuses[e.id] ?? 'PRESENT',
      }));
      return createAttendance(sectionId, { date, records });
    },
    onSuccess: () => {
      toast.success('Yoklama kaydedildi');
      qc.invalidateQueries({ queryKey: ['section-attendance', sectionId, date] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Kaydedilemedi'),
  });

  if (gLoading || aLoading) return <Skeleton height={250} />;

  const enrollments = gradesData?.data ?? [];
  const existingMap = (attData?.data ?? []).reduce((acc, r) => {
    acc[r.enrollment?.id ?? r.enrollmentId] = r.status;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="input-wrapper" style={{ margin: 0 }}>
          <label className="input-label">Tarih</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setStatuses({}); }}
            className="input"
            style={{ width: 180 }}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !enrollments.length}
          style={{ marginTop: 18 }}
        >
          {saveMutation.isPending ? <span className="spinner" /> : <ClipboardCheck size={15} />}
          Yoklamayı Kaydet
        </button>
      </div>

      {!enrollments.length ? (
        <EmptyState icon={ClipboardCheck} title="Kayıtlı öğrenci bulunmuyor" />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Öğrenci</th>
                {ATT_STATUSES.map((s) => <th key={s} style={{ width: 110 }}>{ATT_LABELS[s]}</th>)}
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => {
                const current = statuses[e.id] ?? existingMap[e.id] ?? 'PRESENT';
                return (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.student?.firstName} {e.student?.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{e.student?.studentNumber}</div>
                    </td>
                    {ATT_STATUSES.map((s) => (
                      <td key={s}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                          <input
                            type="radio"
                            name={`att-${e.id}`}
                            value={s}
                            checked={current === s}
                            onChange={() => setStatuses((prev) => ({ ...prev, [e.id]: s }))}
                            style={{ accentColor: s === 'PRESENT' ? 'var(--color-success)' : s === 'ABSENT' ? 'var(--color-danger)' : 'var(--color-warning)' }}
                          />
                          {ATT_LABELS[s]}
                        </label>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ===== Materials Tab =====
const MaterialsTab = ({ sectionId }) => {
  const qc = useQueryClient();

  const { data: materials = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['section-materials', sectionId],
    queryFn: () => getSectionMaterials(sectionId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const form = new FormData();
      form.append('file', file);
      form.append('purpose', 'COURSE_MATERIAL');
      form.append('courseSectionId', sectionId);
      return uploadFile(form);
    },
    onSuccess: () => {
      toast.success('Materyal yüklendi');
      qc.invalidateQueries({ queryKey: ['section-materials', sectionId] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Yüklenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUpload(id),
    onSuccess: () => {
      toast.success('Materyal silindi');
      qc.invalidateQueries({ queryKey: ['section-materials', sectionId] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Silinemedi'),
  });

  if (isLoading) return <Skeleton height={200} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 8, border: '2px dashed var(--color-border)',
            cursor: 'pointer', fontSize: 14, color: 'var(--color-text-secondary)',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
        >
          <Upload size={16} />
          {uploadMutation.isPending ? 'Yükleniyor...' : 'Dosya Yükle'}
          <input
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && uploadMutation.mutate(e.target.files[0])}
          />
        </label>
      </div>

      {!materials.length ? (
        <EmptyState icon={FileText} title="Henüz materyal yüklenmemiş" />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Dosya Adı</th><th>Boyut</th><th>Yüklenme Tarihi</th><th style={{ width: 60 }}></th></tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id}>
                  <td>
                    <a href={`http://localhost:5000/uploads/${m.filename}`} target="_blank" rel="noreferrer"
                      style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 13 }}>
                      {m.originalName ?? m.filename}
                    </a>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {m.size ? `${(m.size / 1024).toFixed(1)} KB` : '—'}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {dayjs(m.createdAt).format('DD.MM.YYYY HH:mm')}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => deleteMutation.mutate(m.id)}
                    >
                      <Trash2 size={13} />
                    </button>
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

// ===== Read-Only Weekly/Exam Tabs =====
const ReadOnlyWeeklyTab = ({ sectionId }) => {
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['weekly-schedule', sectionId],
    queryFn: () => getSectionWeeklySchedule(sectionId),
  });
  if (isLoading) return <Skeleton height={150} />;
  if (!slots.length) return <EmptyState icon={Clock} title="Haftalık program girilmemiş" />;
  return (
    <div className="table-container">
      <table className="table">
        <thead><tr><th>Gün</th><th>Saat</th><th>Derslik</th></tr></thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s.id}>
              <td><span className="badge badge-blue">{DAY_LABELS[s.dayOfWeek]}</span></td>
              <td style={{ fontSize: 13 }}>{s.startTime} – {s.endTime}</td>
              <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{s.classroom || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReadOnlyExamTab = ({ sectionId }) => {
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exam-schedule', sectionId],
    queryFn: () => getSectionExamSchedule(sectionId),
  });
  if (isLoading) return <Skeleton height={150} />;
  if (!exams.length) return <EmptyState icon={Calendar} title="Sınav programı girilmemiş" />;
  return (
    <div className="table-container">
      <table className="table">
        <thead><tr><th>Tür</th><th>Tarih</th><th>Saat</th><th>Süre</th><th>Salon</th></tr></thead>
        <tbody>
          {exams.map((e) => (
            <tr key={e.id}>
              <td><span className="badge badge-purple">{EXAM_LABELS[e.examType]}</span></td>
              <td style={{ fontSize: 13 }}>{dayjs(e.examDate).format('DD.MM.YYYY')}</td>
              <td style={{ fontSize: 13 }}>{e.startTime}</td>
              <td style={{ fontSize: 13 }}>{e.duration} dk</td>
              <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{e.classroom || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ===== Main =====
const AcademicianCourseSectionWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('grades');

  const { data: section, isLoading, isError, refetch } = useQuery({
    queryKey: ['course-section', id],
    queryFn: () => getCourseSection(id),
  });

  const TABS = [
    { id: 'grades', label: 'Not Girişi' },
    { id: 'attendance', label: 'Devamsızlık' },
    { id: 'materials', label: 'Materyaller' },
    { id: 'schedule', label: 'Haftalık Program' },
    { id: 'exams', label: 'Sınav Programı' },
  ];

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Ders Şubesi" />
        <div className="card"><Skeleton height={400} /></div>
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
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>
        <div style={{ padding: 24 }}>
          {activeTab === 'grades' && <GradeEntryTab sectionId={id} />}
          {activeTab === 'attendance' && <AttendanceTab sectionId={id} />}
          {activeTab === 'materials' && <MaterialsTab sectionId={id} />}
          {activeTab === 'schedule' && <ReadOnlyWeeklyTab sectionId={id} />}
          {activeTab === 'exams' && <ReadOnlyExamTab sectionId={id} />}
        </div>
      </div>
    </div>
  );
};

export default AcademicianCourseSectionWorkspace;
