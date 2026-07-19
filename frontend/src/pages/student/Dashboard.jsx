import { useQuery } from '@tanstack/react-query';
import { GraduationCap, CalendarClock, Award, BookOpen, Megaphone, Clock } from 'lucide-react';
import { getDashboardStudent } from '../../api/dashboard.api';
import { StatCard, CardSkeleton, ErrorState, EmptyState, PageHeader, StatusBadge } from '../../components/ui/index';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

const examTypeLabel = { MIDTERM: 'Vize', FINAL: 'Final', MAKEUP: 'Bütünleme' };
const dayLabel = { MONDAY:'Pazartesi',TUESDAY:'Salı',WEDNESDAY:'Çarşamba',THURSDAY:'Perşembe',FRIDAY:'Cuma',SATURDAY:'Cumartesi',SUNDAY:'Pazar' };

const StudentDashboard = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: getDashboardStudent,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Hoş Geldiniz 👋"
        subtitle="Akademik durumunuza genel bakış"
      />

      {/* Stats */}
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
        {/* Upcoming exams */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CalendarClock size={16} color="#d97706" />
            </div>
            <h2 style={{ fontSize:15, fontWeight:700, margin:0 }}>Yaklaşan Sınavlar</h2>
          </div>

          {!data?.upcomingExams?.length ? (
            <EmptyState icon={CalendarClock} title="Yaklaşan sınav yok" description="Tüm sınavlarınız tamamlandı" />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {data.upcomingExams.map(exam => (
                <div key={exam.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--color-surface-2)', borderRadius:10, border:'1px solid var(--color-border)' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{exam.courseSection.course.name}</div>
                    <div style={{ fontSize:12, color:'var(--color-text-muted)', marginTop:2 }}>
                      {dayjs(exam.examDate).format('DD MMM YYYY')} · {exam.startTime}–{exam.endTime} · {exam.classroom}
                    </div>
                  </div>
                  <span className="badge badge-blue">{examTypeLabel[exam.examType]}</span>
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
                <div key={a.id} style={{ padding:'10px 14px', background:'var(--color-surface-2)', borderRadius:10, border:'1px solid var(--color-border)', cursor:'pointer', transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--color-surface-3)'}
                  onMouseLeave={e=>e.currentTarget.style.background='var(--color-surface-2)'}
                >
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{a.title}</div>
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
    </div>
  );
};

export default StudentDashboard;
