import { useQuery } from '@tanstack/react-query';
import { getMyAnalytics } from '../../api/advanced.api';
import { PageHeader, CardSkeleton, ErrorState } from '../../components/ui/index';
import { BarChart3, TrendingUp, Award, BookOpen, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#c026d3', '#ea580c'];

const Analytics = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['student-analytics'],
    queryFn: getMyAnalytics,
  });

  if (isLoading) return <CardSkeleton count={4} />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Akademik Analizlerim" subtitle="Not trendleri, not dağılımı ve devam istatistikleri" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <Award size={28} color="#2563eb" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb' }}>{data.cumulativeGpa?.toFixed(2) ?? '—'}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Genel BPNO</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <BookOpen size={28} color="#7c3aed" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>{data.totalCredits}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Toplam Kredi</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <TrendingUp size={28} color="#059669" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{data.passedCourses}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Geçilen Ders</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <Clock size={28} color="#dc2626" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626' }}>{data.failedCourses}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Başarısız Ders</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} /> Dönemlik GPA Trendi
          </h3>
          {data.gpaTrends?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.gpaTrends.map(t => ({ name: `${t.academicYear} ${t.semester === 'FALL' ? 'Güz' : t.semester === 'SPRING' ? 'Bahar' : 'Yaz'}`, gpa: t.gpa }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis domain={[0, 4]} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="gpa" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="GPA" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 40 }}>Veri yok</p>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} /> Harf Notu Dağılımı
          </h3>
          {data.gradeDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="letter" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="Sayı" radius={[4, 4, 0, 0]}>
                  {data.gradeDistribution.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 40 }}>Veri yok</p>
          )}
        </div>
      </div>

      {data.attendanceSummary?.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} /> Ders Bazlı Devam Durumu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.attendanceSummary.map(a => (
              <div key={a.courseName} style={{ padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{a.courseName}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: '#059669' }}>Geldi: {a.present}</span>
                  <span style={{ color: '#dc2626' }}>Gelmedi: {a.absent}</span>
                  <span style={{ color: '#d97706' }}>Geç: {a.late}</span>
                </div>
                <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${a.rate}%`, background: a.rate >= 70 ? '#059669' : a.rate >= 50 ? '#d97706' : '#dc2626', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, textAlign: 'right' }}>%{a.rate}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
