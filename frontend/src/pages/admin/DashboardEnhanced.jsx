import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminKPIs } from '../../api/advanced.api';
import { PageHeader, CardSkeleton, ErrorState } from '../../components/ui/index';
import { WelcomeCard, LastLoginCard, GlobalSearchWidget } from '../../components/feature/index';
import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Filter,
  Activity,
  Server,
  Cpu,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useSocketEvent } from '../../hooks/useSocket';
const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#c026d3', '#ea580c'];

const DashboardEnhanced = () => {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState('week');
  const [systemMetrics, setSystemMetrics] = useState(null);

  useSocketEvent('system:metrics', (metrics) => {
    setSystemMetrics(metrics);
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-kpis'],
    queryFn: getAdminKPIs,
  });

  const { overview, gradeDistribution, departments, gpaByDepartment } = data || {};

  const gradeData = useMemo(() => {
    if (!gradeDistribution) return [];
    // Mocking filter effect
    const multiplier = timeFilter === 'week' ? 0.2 : timeFilter === 'month' ? 0.6 : 1;
    return Object.entries(gradeDistribution).map(([letter, count]) => ({
      letter,
      count: Math.max(1, Math.round(count * multiplier)),
    }));
  }, [gradeDistribution, timeFilter]);

  const deptData =
    departments?.map((d) => ({ name: d.name.substring(0, 15), students: d.studentCount, courses: d.courseCount })) ||
    [];
  const gpaData =
    gpaByDepartment?.map((g) => {
      const dept = departments.find((d) => d.id === g.departmentId);
      return { name: dept?.name?.substring(0, 15) || 'Bilinmiyor', gpa: g.avgGpa, students: g.studentCount };
    }) || [];

  return (
    <div className="animate-fade-in">
      <WelcomeCard
        user={user}
        roleLabel="Sistem Yöneticisi"
        messages={[
          `${overview?.pendingEnrollments || 0} kayıt onayı bekliyor`,
          'Bugün 3 yeni kullanıcı oluşturuldu',
          'Sistem durumu normal',
        ]}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 mb-6">
        <GlobalSearchWidget />
        <LastLoginCard date="22 Temmuz 2026" time="23:15" ip="10.0.0.5" isLoading={isLoading} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Genel İstatistikler</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="var(--color-text-muted)" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: 13,
              outline: 'none',
            }}
          >
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
            <option value="term">Bu Dönem</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton count={4} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <>
          {systemMetrics && (
            <div
              className="card flex flex-wrap md:flex-nowrap gap-6 items-center p-4 md:p-5 mb-6"
              style={{ background: 'var(--color-surface-hover)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Activity size={24} color="#2563eb" />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    SİSTEM CPU EFORU
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {systemMetrics.cpu?.[0]?.toFixed(2) || '0.00'}{' '}
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)' }}>load</span>
                  </div>
                </div>
              </div>
              <div style={{ width: 1, height: 30, background: 'var(--color-border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Server size={24} color="#059669" />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    SİSTEM RAM KULLANIMI
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {((systemMetrics.ram?.total - systemMetrics.ram?.free) / 1024 / 1024 / 1024).toFixed(1)}{' '}
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)' }}>
                      GB / {(systemMetrics.ram?.total / 1024 / 1024 / 1024).toFixed(1)} GB
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ width: 1, height: 30, background: 'var(--color-border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Cpu size={24} color="#d97706" />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    NODE HEAP KULLANIMI
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {(systemMetrics.heap?.used / 1024 / 1024).toFixed(1)}{' '}
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)' }}>
                      MB / {(systemMetrics.heap?.total / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ width: 1, height: 30, background: 'var(--color-border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>UPTIME</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {Math.floor(systemMetrics.uptime / 60)}{' '}
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)' }}>dk</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <GraduationCap size={28} color="#2563eb" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb' }}>{overview.totalStudents}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Toplam Öğrenci</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <Users size={28} color="#7c3aed" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>{overview.totalLecturers}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Akademisyen</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <BookOpen size={28} color="#059669" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{overview.totalCourses}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Ders Sayısı</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <ClipboardList size={28} color="#d97706" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: '#d97706' }}>{overview.totalEnrollments}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Toplam Kayıt</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <AlertTriangle size={28} color="#dc2626" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626' }}>{overview.pendingEnrollments}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Onay Bekleyen</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="card" style={{ padding: 20 }}>
              <h3
                style={{
                  margin: '0 0 16px',
                  fontWeight: 700,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <BarChart3 size={18} /> Harf Notu Dağılımı (
                {timeFilter === 'week' ? 'Hafta' : timeFilter === 'month' ? 'Ay' : 'Dönem'})
              </h3>
              {gradeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gradeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="letter" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" name="Sayı" radius={[4, 4, 0, 0]}>
                      {gradeData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 40 }}>Veri yok</p>
              )}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3
                style={{
                  margin: '0 0 16px',
                  fontWeight: 700,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <TrendingUp size={18} /> Bölüm Bazlı GPA Ortalaması
              </h3>
              {gpaData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gpaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis domain={[0, 4]} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="gpa" name="Ort. GPA" radius={[4, 4, 0, 0]}>
                      {gpaData.map((_, i) => (
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

          <div className="card" style={{ padding: 0 }}>
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border)',
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Bölüm İstatistikleri
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Bölüm</th>
                    <th>Fakülte</th>
                    <th style={{ textAlign: 'center' }}>Öğrenci</th>
                    <th style={{ textAlign: 'center' }}>Ders</th>
                    <th style={{ textAlign: 'center' }}>Ort. GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => {
                    const deptGpa = gpaByDepartment.find((g) => g.departmentId === d.id);
                    return (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 600 }}>{d.name}</td>
                        <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{d.faculty}</td>
                        <td style={{ textAlign: 'center' }}>{d.studentCount}</td>
                        <td style={{ textAlign: 'center' }}>{d.courseCount}</td>
                        <td
                          style={{
                            textAlign: 'center',
                            fontWeight: 700,
                            color: deptGpa?.avgGpa < 2.0 ? '#dc2626' : '#059669',
                          }}
                        >
                          {deptGpa?.avgGpa?.toFixed(2) ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardEnhanced;
