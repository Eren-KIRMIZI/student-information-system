import { useQuery } from '@tanstack/react-query';
import { BookCopy, Users, ClipboardList, Megaphone, Clock, CheckSquare, FileWarning } from 'lucide-react';
import { getDashboardAcademician } from '../../api/dashboard.api';
import { StatCard, CardSkeleton, ErrorState, EmptyState, PageHeader } from '../../components/ui/index';
import { DashboardCard, DashboardListItem, RecentActivity, WelcomeCard, LastLoginCard } from '../../components/feature/index';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useAnnouncementSocket, useEnrollmentSocket } from '../../hooks/useSocket';
dayjs.locale('tr');

const AcademicianDashboard = () => {
  useAnnouncementSocket();
  useEnrollmentSocket();
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'academician'],
    queryFn: getDashboardAcademician,
  });

  return (
    <div className="animate-fade-in">
      <WelcomeCard 
        user={user} 
        roleLabel="Akademisyen" 
        messages={[
          `Bugün ${data?.sections?.length || 0} dersiniz bulunuyor`,
          `${data?.pendingEnrollments || 0} kayıt onayı bekliyor`,
          `Sistem durumu normal`
        ]} 
        isLoading={isLoading} 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 24 }}>
        <LastLoginCard date="22 Temmuz 2026" time="08:45" ip="10.0.1.42" isLoading={isLoading} />
      </div>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16, marginBottom:24 }}>
            <StatCard label="Verdiğim Şube" value={data?.totalSections ?? 0} icon={BookCopy} color="#2563eb" />
            <StatCard label="Toplam Öğrenci" value={data?.totalStudents ?? 0} icon={Users} color="#7c3aed" />
            <StatCard label="Bekleyen Kayıt" value={data?.pendingEnrollments ?? 0} icon={ClipboardList} color="#d97706" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <DashboardCard icon={CheckSquare} iconBg="#f0fdf4" iconColor="#16a34a" title="Bugünkü Görevler">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--color-surface)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookCopy size={20} />
                  </div>
                  <div style={{ flex: 1, fontSize: 14 }}>
                    <div style={{ fontWeight: 600 }}>Yazılım Mühendisliği - Şube 1</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Bugün, 10:00 - 12:00</div>
                  </div>
                  <button className="btn btn-sm btn-outline" style={{ fontSize: 12 }}>Yoklama Al</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ClipboardList size={20} />
                  </div>
                  <div style={{ flex: 1, fontSize: 14 }}>
                    <div style={{ fontWeight: 600 }}>Bekleyen Kayıt Onayları</div>
                    <div style={{ fontSize: 12, color: '#92400e' }}>12 öğrenci onay bekliyor</div>
                  </div>
                  <button className="btn btn-sm btn-primary" style={{ fontSize: 12 }}>İncele</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileWarning size={20} />
                  </div>
                  <div style={{ flex: 1, fontSize: 14 }}>
                    <div style={{ fontWeight: 600 }}>Girilmeyen Notlar</div>
                    <div style={{ fontSize: 12, color: '#991b1b' }}>Matematik - Vize notları eksik</div>
                  </div>
                  <button className="btn btn-sm" style={{ fontSize: 12, background: '#ef4444', color: 'white', border: 'none' }}>Not Gir</button>
                </div>
              </div>
            </DashboardCard>

            <RecentActivity activities={[
              { time: '10:45', content: 'Ahmet Yılmaz vize notunu görüntüledi.', color: '#3b82f6' },
              { time: '09:30', content: 'Ayşe Kaya danışman onayına ders gönderdi.', color: '#f59e0b' },
              { time: 'Dün, 15:20', content: 'Yazılım Mühendisliği materyali sisteme yüklendi.', color: '#10b981' },
              { time: 'Dün, 11:00', content: 'Mehmet Demir mezuniyet kontrolü talep etti.', color: '#8b5cf6' }
            ]} />
          </div>
        </>
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
