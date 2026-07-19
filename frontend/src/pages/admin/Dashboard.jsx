import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Users, BookOpen, ClipboardList, Megaphone, TrendingUp } from 'lucide-react';
import { getDashboardAdmin } from '../../api/dashboard.api';
import { StatCard, CardSkeleton, ErrorState, EmptyState, PageHeader, StatusBadge } from '../../components/ui/index';
import { DashboardCard, DashboardListItem } from '../../components/feature/index';
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
          <div className="grid-auto-fill" style={{ marginBottom:24 }}>
            <StatCard label="Toplam Öğrenci" value={data?.totalStudents ?? 0} icon={GraduationCap} color="#2563eb" />
            <StatCard label="Akademisyen" value={data?.totalLecturers ?? 0} icon={Users} color="#7c3aed" />
            <StatCard label="Ders Sayısı" value={data?.totalCourses ?? 0} icon={BookOpen} color="#059669" />
            <StatCard label="Toplam Kayıt" value={data?.totalEnrollments ?? 0} icon={ClipboardList} color="#d97706" />
          </div>

          <div className="grid-auto-fit">
            <DashboardCard icon={TrendingUp} iconBg="#dbeafe" iconColor="#2563eb" title="Son Ders Kayıtları">
              {!data?.recentEnrollments?.length ? (
                <EmptyState icon={ClipboardList} title="Kayıt yok" />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {data.recentEnrollments.slice(0,7).map(e => (
                    <DashboardListItem
                      key={e.id}
                      title={`${e.student.firstName} ${e.student.lastName}`}
                      subtitle={e.courseSection.course.name}
                      badgeStatus={e.status}
                    />
                  ))}
                </div>
              )}
            </DashboardCard>

            <DashboardCard icon={Megaphone} iconBg="#ede9fe" iconColor="#7c3aed" title="Son Duyurular">
              {!data?.announcements?.length ? (
                <EmptyState icon={Megaphone} title="Duyuru yok" />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {data.announcements.map(a => (
                    <DashboardListItem
                      key={a.id}
                      title={a.title}
                      subtitle={`${dayjs(a.publishedAt).format('DD MMM YYYY')}`}
                    />
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
