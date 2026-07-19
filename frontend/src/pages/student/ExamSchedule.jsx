import { useQuery } from '@tanstack/react-query';
import { getMyExamSchedule } from '../../api/system.api';
import { PageHeader, EmptyState, ErrorState, TableSkeleton, StatusBadge } from '../../components/ui/index';
import { CalendarClock } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

const examTypeLabel = { MIDTERM:'Vize',FINAL:'Final',MAKEUP:'Bütünleme' };

const ExamSchedule = () => {
  const { data:exams=[], isLoading, isError, refetch } = useQuery({
    queryKey: ['exam-schedule', 'me'],
    queryFn: () => getMyExamSchedule(),
  });

  const upcoming = exams.filter(e => new Date(e.examDate) >= new Date());
  const past     = exams.filter(e => new Date(e.examDate) <  new Date());

  return (
    <div className="animate-fade-in">
      <PageHeader title="Sınav Programım" subtitle="Tüm dönem sınavlarınız" />

      {/* Upcoming */}
      <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12, color:'var(--color-text-secondary)' }}>
        📅 Yaklaşan Sınavlar ({upcoming.length})
      </h3>

      <div className="card" style={{ padding:0, marginBottom:24 }}>
        {isLoading ? (
          <TableSkeleton rows={3} cols={4} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !upcoming.length ? (
          <EmptyState icon={CalendarClock} title="Yaklaşan sınav yok" description="Tüm sınavlarınız tamamlandı" />
        ) : (
          <div className="table-container" style={{ border:'none', borderRadius:0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ders</th>
                  <th>Sınav Türü</th>
                  <th>Tarih & Saat</th>
                  <th>Sınıf/Yer</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(exam => (
                  <tr key={exam.id}>
                    <td style={{ fontWeight:600 }}>{exam.courseSection?.course?.name ?? '—'}</td>
                    <td><StatusBadge status={exam.examType} /></td>
                    <td>
                      <div style={{ fontWeight:600 }}>{dayjs(exam.examDate).format('DD MMM YYYY, dddd')}</div>
                      <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>{exam.startTime} – {exam.endTime}</div>
                    </td>
                    <td>{exam.classroom ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <>
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12, color:'var(--color-text-secondary)' }}>
            ✅ Geçmiş Sınavlar ({past.length})
          </h3>
          <div className="card" style={{ padding:0 }}>
            <div className="table-container" style={{ border:'none', borderRadius:0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ders</th>
                    <th>Sınav Türü</th>
                    <th>Tarih</th>
                    <th>Sınıf</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map(exam => (
                    <tr key={exam.id} style={{ opacity:0.6 }}>
                      <td style={{ fontWeight:600 }}>{exam.courseSection?.course?.name ?? '—'}</td>
                      <td><StatusBadge status={exam.examType} /></td>
                      <td>{dayjs(exam.examDate).format('DD MMM YYYY')}</td>
                      <td>{exam.classroom ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamSchedule;
