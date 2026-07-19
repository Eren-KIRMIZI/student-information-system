import { useQuery } from '@tanstack/react-query';
import { BookCopy, Users, ClipboardList, Megaphone, Clock } from 'lucide-react';
import { getDashboardAcademician } from '../../api/dashboard.api';
import { StatCard, CardSkeleton, ErrorState, EmptyState, PageHeader } from '../../components/ui/index';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

const AcademicianDashboard = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'academician'],
    queryFn: getDashboardAcademician,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Hoş Geldiniz 👋" subtitle="Öğretim faaliyetlerinize genel bakış" />

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
        {/* My sections */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <BookCopy size={16} color="#2563eb" />
            </div>
            <h2 style={{ fontSize:15, fontWeight:700, margin:0 }}>Ders Şubelerim</h2>
          </div>

          {!data?.sections?.length ? (
            <EmptyState icon={BookCopy} title="Ders şubesi yok" />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {data.sections.map(s => (
                <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--color-surface-2)', borderRadius:10, border:'1px solid var(--color-border)' }}>
                  <span style={{ fontWeight:600, fontSize:14 }}>{s.courseName}</span>
                  <span className="badge badge-blue">{s.studentCount} Öğrenci</span>
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
                <div key={a.id} style={{ padding:'10px 14px', background:'var(--color-surface-2)', borderRadius:10, border:'1px solid var(--color-border)' }}>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{a.title}</div>
                  <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>
                    <Clock size={11} style={{ display:'inline', marginRight:4 }} />{dayjs(a.publishedAt).format('DD MMM YYYY')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicianDashboard;
