import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getLecturer, updateLecturerStatus } from '../../api/people.api';
import { PageHeader, StatusBadge, Skeleton, ErrorState } from '../../components/ui/index';
import {
  ArrowLeft, Mail, Phone, GraduationCap, BookOpen,
  ToggleLeft, ToggleRight, Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
    <Icon size={16} style={{ color: 'var(--color-text-muted)', marginTop: 2, flexShrink: 0 }} />
    <div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{value || '—'}</div>
    </div>
  </div>
);

const LecturerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: lecturer, isLoading, isError, refetch } = useQuery({
    queryKey: ['lecturer', id],
    queryFn: () => getLecturer(id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ isActive }) => updateLecturerStatus(id, isActive),
    onSuccess: (_, vars) => {
      toast.success(`Akademisyen ${vars.isActive ? 'aktif' : 'pasif'} edildi`);
      qc.invalidateQueries({ queryKey: ['lecturer', id] });
      qc.invalidateQueries({ queryKey: ['lecturers'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Güncelleme başarısız'),
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Akademisyen Detayı" />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5">
          <div className="card"><Skeleton height={200} /></div>
          <div className="card"><Skeleton height={200} /></div>
        </div>
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${lecturer.title ?? ''} ${lecturer.firstName} ${lecturer.lastName}`.trim()}
        subtitle={lecturer.department?.name ?? ''}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary"
              onClick={() => statusMutation.mutate({ isActive: !lecturer.user?.isActive })}
              disabled={statusMutation.isPending}
            >
              {lecturer.user?.isActive
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

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-5 items-start">
        {/* Sol — Profil kartı */}
        <div className="card">
          <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', fontWeight: 700,
            }}>
              {lecturer.firstName?.[0]}{lecturer.lastName?.[0]}
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
              {lecturer.firstName} {lecturer.lastName}
            </div>
            <StatusBadge status={lecturer.user?.isActive} />
          </div>

          <InfoRow icon={Award} label="Ünvan" value={lecturer.title} />
          <InfoRow icon={Mail} label="E-posta" value={lecturer.user?.email} />
          <InfoRow icon={Phone} label="Telefon" value={lecturer.phone} />
          <InfoRow icon={GraduationCap} label="Bölüm" value={lecturer.department?.name} />
          <InfoRow icon={BookOpen} label="Fakülte" value={lecturer.department?.faculty?.name} />
        </div>

        {/* Sağ — Verdiği dersler */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Verdiği Dersler (Son 5)</div>
          {!lecturer.sections?.length ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
              <BookOpen size={36} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p>Henüz ders kaydı bulunmuyor.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ders</th>
                    <th>Şube</th>
                    <th>Dönem</th>
                  </tr>
                </thead>
                <tbody>
                  {lecturer.sections.map((sec) => (
                    <tr key={sec.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{sec.course?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{sec.course?.code}</div>
                      </td>
                      <td><span className="badge badge-blue">{sec.sectionCode}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {sec.academicYear}
                      </td>
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

export default LecturerDetail;
