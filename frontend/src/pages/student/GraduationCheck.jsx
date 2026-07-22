import { useQuery } from '@tanstack/react-query';
import { getMyGraduationStatus } from '../../api/advanced.api';
import { PageHeader, CardSkeleton, ErrorState } from '../../components/ui/index';
import { GraduationCap, CheckCircle, XCircle, AlertTriangle, BookOpen, Award, Clock } from 'lucide-react';

const GraduationCheck = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['graduation', 'my'],
    queryFn: getMyGraduationStatus,
  });

  if (isLoading) return <CardSkeleton count={3} />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return null;

  const { checks, canGraduate, remainingCourses, summary } = data;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Mezuniyet Kontrolü" subtitle="Mezuniyet durumunuzu ve eksiklerinizi görüntüleyin" />

      <div className="card" style={{ padding: 24, marginBottom: 20, textAlign: 'center' }}>
        {canGraduate ? (
          <>
            <GraduationCap size={48} color="#059669" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ margin: 0, color: '#059669', fontWeight: 800, fontSize: 22 }}>TEBRİKLER! Mezuniyet Koşullarını Sağlıyorsunuz</h2>
          </>
        ) : (
          <>
            <AlertTriangle size={48} color="#d97706" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ margin: 0, color: '#d97706', fontWeight: 800, fontSize: 22 }}>Henüz Mezuniyet Koşullarını Sağlamıyorsunuz</h2>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginBottom: 20 }}>
        {Object.entries(checks).map(([key, check]) => {
          const labels = {
            totalCredits: 'Toplam Kredi',
            totalEcts: 'Toplam AKTS',
            gpa: 'Genel Not Ortalaması',
            ffCount: 'FF Sayısı',
          };
          return (
            <div key={key} className="card" style={{ padding: 20, borderLeft: `4px solid ${check.met ? '#059669' : '#dc2626'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{labels[key]}</span>
                {check.met ? <CheckCircle size={18} color="#059669" /> : <XCircle size={18} color="#dc2626" />}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: check.met ? '#059669' : '#dc2626' }}>
                {check.current} {key === 'gpa' ? '' : '/'}
                {key === 'gpa' ? null : <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--color-text-muted)' }}> {check.required || check.minimum}</span>}
              </div>
              {key === 'gpa' && (
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  Min: {check.minimum}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} /> Kalan Dersler ({remainingCourses?.length || 0})
          </h3>
          {remainingCourses?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
              {remainingCourses.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: 8, fontSize: 13 }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{c.code}</span> — {c.name}
                  </div>
                  <span style={{ color: 'var(--color-text-muted)' }}>{c.credit} KR / {c.ects} AKTS</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Tüm dersler tamamlanmış.</p>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} /> Genel Durum
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 13 }}>Alınan Ders</span>
              <span style={{ fontWeight: 700 }}>{summary.totalCourses}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 13 }}>Geçilen Ders</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>{summary.passed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 13 }}>Kalınan Ders</span>
              <span style={{ fontWeight: 700, color: '#dc2626' }}>{summary.failed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ fontSize: 13 }}>Kalan Ders</span>
              <span style={{ fontWeight: 700, color: '#d97706' }}>{summary.remaining}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraduationCheck;
