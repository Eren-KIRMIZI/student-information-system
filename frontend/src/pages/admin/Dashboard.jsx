import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Users, BookOpen, ClipboardList, Megaphone, TrendingUp, FileText, Download } from 'lucide-react';
import { getDashboardAdmin } from '../../api/dashboard.api';
import { StatCard, CardSkeleton, ErrorState, EmptyState, PageHeader, StatusBadge } from '../../components/ui/index';
import { DashboardCard, DashboardListItem, QuickActions, NotificationWidget, RecentActivity, CalendarWidget, SystemHealth } from '../../components/feature/index';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useAnnouncementSocket, useEnrollmentSocket } from '../../hooks/useSocket';
dayjs.locale('tr');

const AdminDashboard = () => {
  useAnnouncementSocket();
  useEnrollmentSocket();
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
            <StatCard label="Toplam Materyal" value={data?.totalMaterials ?? 0} icon={FileText} color="#0ea5e9" />
            <StatCard label="Bugün Yüklenen" value={data?.materialsToday ?? 0} icon={Download} color="#14b8a6" />
          </div>

          <div style={{ marginBottom: 24 }}>
            <QuickActions />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <NotificationWidget notifications={[
              { status: 'red', count: 6, text: 'kayıt bekliyor' },
              { status: 'orange', count: 3, text: 'danışman ataması bekliyor' },
              { status: 'yellow', count: 8, text: 'öğrencinin mezuniyet kontrolü eksik' },
              { status: 'green', text: 'Sistem normal çalışıyor' }
            ]} />
            <RecentActivity activities={[
              { time: '09:30', content: 'Ali Veli MAT101\'e kayıt oldu.', color: '#3b82f6' },
              { time: '09:36', content: 'Ayşe Kaya Final notlarını girdi.', color: '#10b981' },
              { time: '09:42', content: 'Bilgisayar Mühendisliği duyurusu yayınlandı.', color: '#8b5cf6' },
              { time: '09:45', content: 'Yeni ders oluşturuldu.', color: '#f59e0b' },
              { time: '09:48', content: 'Danışman ataması yapıldı.', color: '#ec4899' }
            ]} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <SystemHealth />
            <CalendarWidget />
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
            <DashboardCard icon={FileText} iconBg="#e0f2fe" iconColor="#0ea5e9" title="En Çok İndirilen Materyaller">
              {!data?.mostDownloadedMaterials?.length ? (
                <EmptyState icon={FileText} title="Materyal yok" />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {data.mostDownloadedMaterials.map(m => (
                    <DashboardListItem
                      key={m.id}
                      title={m.title}
                      subtitle={`${m.courseSection.course.code} — ${m.downloadCount} indirme`}
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
