import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent, updateStudentStatus } from '../../api/people.api';
import { PageHeader, StatusBadge, Skeleton, ErrorState } from '../../components/ui/index';
import {
  ArrowLeft, Mail, Phone, MapPin, GraduationCap,
  BookOpen, User, ToggleLeft, ToggleRight, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
    <Icon size={16} style={{ color: 'var(--color-text-muted)', marginTop: 2, flexShrink: 0 }} />
    <div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{value || '—'}</div>
    </div>
  </div>
);

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: student, isLoading, isError, refetch } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ isActive }) => updateStudentStatus(id, isActive),
    onSuccess: (_, vars) => {
      toast.success(`Öğrenci ${vars.isActive ? 'aktif' : 'pasif'} edildi`);
      qc.invalidateQueries({ queryKey: ['student', id] });
      qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Güncelleme başarısız'),
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Öğrenci Detayı" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          <div className="card"><Skeleton height={200} /></div>
          <div className="card"><Skeleton height={200} /></div>
        </div>
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;

  const advisor = student?.advisorHistory?.[0]?.lecturer;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={`${student.studentNumber} • ${student.department?.name ?? ''}`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary"
              onClick={() => statusMutation.mutate({ isActive: !student.user?.isActive })}
              disabled={statusMutation.isPending}
            >
              {student.user?.isActive
                ? <><ToggleRight size={16} /> Pasifleştir</>
                : <><ToggleLeft size={16} /> Aktifleştir</>
              }
            </button>
            <button className="btn btn-ghost" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Geri
            </button>
          </div>
        }
      />

      <div className="detail-grid" style={{ gridTemplateColumns: '340px 1fr' }}>
        {/* Sol — Profil kartı */}
        <div className="card">
          <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', fontWeight: 700,
            }}>
              {student.firstName?.[0]}{student.lastName?.[0]}
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
              {student.firstName} {student.lastName}
            </div>
            <StatusBadge status={student.user?.isActive} />
          </div>

          <InfoRow icon={Mail} label="E-posta" value={student.user?.email} />
          <InfoRow icon={Phone} label="Telefon" value={student.phone} />
          <InfoRow icon={MapPin} label="Adres" value={student.address} />
          <InfoRow icon={Calendar} label="Doğum Tarihi" value={student.birthDate ? dayjs(student.birthDate).format('DD.MM.YYYY') : null} />
          <InfoRow icon={GraduationCap} label="Bölüm" value={student.department?.name} />
          <InfoRow icon={BookOpen} label="Fakülte" value={student.department?.faculty?.name} />
          <InfoRow icon={User} label="Danışman" value={advisor ? `${advisor.title ?? ''} ${advisor.firstName} ${advisor.lastName}`.trim() : null} />
        </div>

        {/* Sağ — Son kayıtlar */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Son Ders Kayıtları</div>
          {!student.enrollments?.length ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
              <BookOpen size={36} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p>Henüz kayıt bulunmuyor.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ders</th>
                    <th>Şube</th>
                    <th>Dönem</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {student.enrollments.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{e.courseSection?.course?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{e.courseSection?.course?.code}</div>
                      </td>
                      <td><span className="badge badge-blue">{e.courseSection?.sectionCode}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {e.courseSection?.academicYear}
                      </td>
                      <td><StatusBadge status={e.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
