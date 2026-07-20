import { useQuery } from '@tanstack/react-query';
import { BookCopy, Users, ClipboardList, Megaphone, Clock } from 'lucide-react';
import { getDashboardAcademician } from '../../api/dashboard.api';
import { StatCard, CardSkeleton, ErrorState, EmptyState, PageHeader } from '../../components/ui/index';
import { DashboardCard, DashboardListItem } from '../../components/feature/index';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useAnnouncementSocket, useEnrollmentSocket } from '../../hooks/useSocket';
dayjs.locale('tr');

const AcademicianDashboard = () => {
  useAnnouncementSocket();
  useEnrollmentSocket();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'academician'],
    queryFn: getDashboardAcademician,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Hoş Geldiniz" subtitle="Öğretim faaliyetlerinize genel bakış" />

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16, marginBottom:24 }}>
          <StatCard label="Verdiğim Şube" value={data?.totalSections ?? 0} icon={BookCopy} color="#2563eb" />
          <StatCard label="Toplam Öğrenci" value={data?.totalStudents ?? 0} icon={Users} color="#7c3aed" />
          <StatCard label="Bekleyen Kayıt" value={data?.pendingEnrollments ?? 0} icon={ClipboardList} color="#d97706" />
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <DashboardCard icon={BookCopy} iconBg="#dbeafe" iconColor="#2563eb" title="Ders Şubelerim">
          {!data?.sections?.length ? (
            <EmptyState icon={BookCopy} title="Ders şubesi yok" />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {data.sections.map(s => (
                <DashboardListItem
                  key={s.id}
                  title={s.courseName}
                  badge={<span className="badge badge-blue">{s.studentCount} Öğrenci</span>}
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
                  trailing={<Clock size={14} style={{ color: 'var(--color-text-muted)' }} />}
                />
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
};

export default AcademicianDashboard;
