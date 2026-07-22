import { useQuery } from '@tanstack/react-query';
import { GraduationCap, CalendarClock, Award, BookOpen, Megaphone, Clock, MessageCircle, FileText } from 'lucide-react';
import { getDashboardStudent } from '../../api/dashboard.api';
import { StatCard, CardSkeleton, ErrorState, EmptyState, PageHeader } from '../../components/ui/index';
import { ExamListItem, DashboardCard, DashboardListItem, ProgressWidget, WelcomeCard, LastLoginCard } from '../../components/feature/index';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useAnnouncementSocket, useEnrollmentSocket } from '../../hooks/useSocket';
dayjs.locale('tr');

const StudentDashboard = () => {
  useAnnouncementSocket();
  useEnrollmentSocket();
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: getDashboardStudent,
  });

  return (
    <div className="animate-fade-in">
      <WelcomeCard 
        user={user} 
        roleLabel="Öğrenci" 
        messages={[
          `Bugün ${data?.upcomingExams?.length || 0} sınavınız var`,
          `${data?.announcements?.length || 0} duyuru bulunuyor`,
          data?.unreadMessages ? `${data.unreadMessages} okunmamış mesajınız var` : `Okunmamış mesajınız yok`
        ]} 
        isLoading={isLoading} 
      />

      <div className="grid grid-cols-1 gap-5 mb-6">
        <LastLoginCard date="21 Temmuz 2026" time="15:30" ip="192.168.1.105" isLoading={isLoading} />
      </div>

      {isLoading ? (
        <CardSkeleton count={4} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16, marginBottom:24 }}>
            <StatCard label="Genel Not Ortalaması" value={data?.gpa?.toFixed(2) ?? '—'} icon={Award} color="#2563eb" />
            <StatCard label="Kayıtlı Ders" value={data?.totalCourses ?? 0} icon={BookOpen} color="#7c3aed" />
            <StatCard label="Yaklaşan Sınav" value={data?.upcomingExams?.length ?? 0} icon={CalendarClock} color="#d97706" />
            <StatCard label="Okunmamış Mesaj" value={data?.unreadMessages ?? 0} icon={MessageCircle} color="#ec4899" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ProgressWidget 
                title="AKTS İlerlemesi" 
                current={data?.totalEcts || 0} 
                total={240} 
                suffix="AKTS" 
                color="#059669" 
              />
              <ProgressWidget 
                title="Mezuniyet Durumu" 
                current={data?.totalEcts ? Math.min(100, Math.round((data.totalEcts / 240) * 100)) : 0} 
                total={100} 
                suffix="%" 
                color="#2563eb" 
              />
            </div>

            <DashboardCard icon={BookOpen} iconBg="#eff6ff" iconColor="#3b82f6" title="Bugünün Özeti">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--color-surface)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <div style={{ flex: 1, fontSize: 14 }}>
                    <span style={{ fontWeight: 600 }}>Yazılım Mühendisliği</span> (10:00 - 12:00)
                  </div>
                  <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Yoklama Açık
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--color-surface)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6b7280' }} />
                  <div style={{ flex: 1, fontSize: 14 }}>
                    <span style={{ fontWeight: 600 }}>Algoritma Analizi</span> (14:00 - 16:00)
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ flex: 1, fontSize: 14, color: '#92400e' }}>
                    <span style={{ fontWeight: 600 }}>2</span> adet bekleyen ders kayıt talebiniz var.
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

      <div className="grid grid-cols-1 gap-5 mt-6">
        <DashboardCard icon={FileText} iconBg="#e0f2fe" iconColor="#0ea5e9" title="Son Eklenen Materyaller">
          {!data?.recentMaterials?.length ? (
            <EmptyState icon={FileText} title="Materyal yok" />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {data.recentMaterials.map(m => (
                <DashboardListItem
                  key={m.id}
                  title={m.title}
                  subtitle={`${m.courseSection.course.code} — ${dayjs(m.createdAt).format('DD MMM YYYY')}`}
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
