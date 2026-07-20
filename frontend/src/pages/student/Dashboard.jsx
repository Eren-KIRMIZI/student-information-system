import { useQuery } from '@tanstack/react-query';
import { GraduationCap, CalendarClock, Award, BookOpen, Megaphone, Clock } from 'lucide-react';
import { getDashboardStudent } from '../../api/dashboard.api';
import { StatCard, CardSkeleton, ErrorState, EmptyState, PageHeader } from '../../components/ui/index';
import { ExamListItem, DashboardCard, DashboardListItem } from '../../components/feature/index';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useAnnouncementSocket, useEnrollmentSocket } from '../../hooks/useSocket';
dayjs.locale('tr');

const StudentDashboard = () => {
  useAnnouncementSocket();
  useEnrollmentSocket();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: getDashboardStudent,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Hoş Geldiniz" subtitle="Akademik durumunuza genel bakış" />

      {isLoading ? (
        <CardSkeleton count={4} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16, marginBottom:24 }}>
          <StatCard label="Genel Not Ortalaması" value={data?.gpa?.toFixed(2) ?? '—'} icon={Award} color="#2563eb" />
          <StatCard label="Kayıtlı Ders" value={data?.totalCourses ?? 0} icon={BookOpen} color="#7c3aed" />
          <StatCard label="Toplam AKTS" value={data?.totalEcts ?? 0} icon={GraduationCap} color="#059669" />
          <StatCard label="Yaklaşan Sınav" value={data?.upcomingExams?.length ?? 0} icon={CalendarClock} color="#d97706" />
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <DashboardCard icon={CalendarClock} iconBg="#fef3c7" iconColor="#d97706" title="Yaklaşan Sınavlar">
          {!data?.upcomingExams?.length ? (
            <EmptyState icon={CalendarClock} title="Yaklaşan sınav yok" description="Tüm sınavlarınız tamamlandı" />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {data.upcomingExams.map(exam => (
                <ExamListItem key={exam.id} exam={exam} />
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

export default StudentDashboard;
