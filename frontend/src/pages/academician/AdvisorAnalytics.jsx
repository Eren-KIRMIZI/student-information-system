import { useQuery } from '@tanstack/react-query';
import { getAdvisorStudents } from '../../api/advanced.api';
import { PageHeader, CardSkeleton, ErrorState, StatCard, StatusBadge } from '../../components/ui/index';
import { Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

const AdvisorAnalytics = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['advisor-analytics'],
    queryFn: getAdvisorStudents,
  });

  if (isLoading) return <CardSkeleton count={3} />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return null;

  const { advisees, summary } = data;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Danışmanlık Analizi" subtitle="Öğrencilerinizin akademik durumu ve risk analizi" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <Users size={28} color="#2563eb" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb' }}>{summary.total}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Toplam Danışan</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <AlertTriangle size={28} color="#dc2626" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626' }}>{summary.highRisk}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Yüksek Risk</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <TrendingUp size={28} color="#d97706" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: '#d97706' }}>{summary.mediumRisk}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Orta Risk</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <CheckCircle size={28} color="#059669" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{summary.lowRisk}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Düşük Risk</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15 }}>Öğrenci GPA Dağılımı</h3>
          {advisees.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={advisees.map(s => ({ name: `${s.firstName} ${s.lastName}`, gpa: s.gpa }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis domain={[0, 4]} fontSize={12} />
                <Tooltip />
                <Bar dataKey="gpa" name="GPA" radius={[4, 4, 0, 0]}>
                  {advisees.map((s, i) => (
                    <Bar key={i} fill={s.riskLevel === 'HIGH' ? '#dc2626' : s.riskLevel === 'MEDIUM' ? '#d97706' : '#059669'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Öğrenci verisi yok" />
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15 }}>Risk Durumu</h3>
          {advisees.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: 'Yüksek', count: summary.highRisk },
                { name: 'Orta', count: summary.mediumRisk },
                { name: 'Düşük', count: summary.lowRisk },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="Öğrenci Sayısı" radius={[4, 4, 0, 0]}>
                  {[
                    <Bar key="high" fill="#dc2626" />,
                    <Bar key="medium" fill="#d97706" />,
                    <Bar key="low" fill="#059669" />,
                  ]}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Veri yok" />
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: 15 }}>
          Danışan Öğrenci Listesi
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Bölüm</th>
                <th>Sınıf</th>
                <th>GPA</th>
                <th>Aktif Ders</th>
                <th>Başarısız</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {advisees.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{s.department}</td>
                  <td style={{ fontSize: 13 }}>{s.classYear}. Sınıf</td>
                  <td style={{ fontWeight: 700, color: s.gpa < 2.0 ? '#dc2626' : s.gpa < 3.0 ? '#d97706' : '#059669' }}>
                    {s.gpa?.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'center' }}>{s.activeCourses}</td>
                  <td style={{ textAlign: 'center', color: s.failedCourses > 0 ? '#dc2626' : undefined }}>{s.failedCourses}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: s.riskLevel === 'HIGH' ? '#fef2f2' : s.riskLevel === 'MEDIUM' ? '#fffbeb' : '#f0fdf4',
                      color: s.riskLevel === 'HIGH' ? '#dc2626' : s.riskLevel === 'MEDIUM' ? '#d97706' : '#059669',
                    }}>
                      {s.riskLevel === 'HIGH' ? 'Yüksek' : s.riskLevel === 'MEDIUM' ? 'Orta' : 'Düşük'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvisorAnalytics;
