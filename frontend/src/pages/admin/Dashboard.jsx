import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Users, BookOpen, ClipboardList, Megaphone, Clock, TrendingUp } from 'lucide-react';
import { getDashboardAdmin } from '../../api/dashboard.api';
import { StatCard, CardSkeleton, ErrorState, EmptyState, PageHeader, StatusBadge } from '../../components/ui/index';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

const AdminDashboard = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: getDashboardAdmin,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Sistem Yönetimi" subtitle="Genel sistem durumuna bakış" />

      {isLoading ? (
        <CardSkeleton count={4} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <>
          {/* Stats */}
          <div className="grid-auto-fill" style={{ marginBottom:24 }}>
            <StatCard label="Toplam Öğrenci" value={data?.totalStudents ?? 0} icon={GraduationCap} color="#2563eb" />
            <StatCard label="Akademisyen" value={data?.totalLecturers ?? 0} icon={Users} color="#7c3aed" />
            <StatCard label="Ders Sayısı" value={data?.totalCourses ?? 0} icon={BookOpen} color="#059669" />
            <StatCard label="Toplam Kayıt" value={data?.totalEnrollments ?? 0} icon={ClipboardList} color="#d97706" />
          </div>

          <div className="grid-auto-fit">
            {/* Recent Enrollments */}
            <div className="card">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <TrendingUp size={16} color="#2563eb" />
                </div>
                <h2 style={{ fontSize:15, fontWeight:700, margin:0 }}>Son Ders Kayıtları</h2>
              </div>

              {!data?.recentEnrollments?.length ? (
                <EmptyState icon={ClipboardList} title="Kayıt yok" />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {data.recentEnrollments.slice(0,7).map(e => (
                    <div key={e.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'var(--color-surface-2)', borderRadius:8, border:'1px solid var(--color-border)' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>
                          {e.student.firstName} {e.student.lastName}
                        </div>
                        <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>
                          {e.courseSection.course.name}
                        </div>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Announcements */}
            <div className="card">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Megaphone size={16} color="#7c3aed" />
                </div>
                <h2 style={{ fontSize:15, fontWeight:700, margin:0 }}>Son Duyurular</h2>
              </div>

              {!data?.announcements?.length ? (
                <EmptyState icon={Megaphone} title="Duyuru yok" />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {data.announcements.map(a => (
                    <div key={a.id} style={{ padding:'10px 12px', background:'var(--color-surface-2)', borderRadius:8, border:'1px solid var(--color-border)' }}>
                      <div style={{ fontWeight:600, fontSize:13, marginBottom:3 }}>{a.title}</div>
                      <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>
                        <Clock size={11} style={{ display:'inline', marginRight:4 }} />
                        {dayjs(a.publishedAt).format('DD MMM YYYY')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
