import { useQuery } from '@tanstack/react-query';
import { getMyExamSchedule } from '../../api/system.api';
import { PageHeader, EmptyState, ErrorState, TableSkeleton } from '../../components/ui/index';
import { ExamListItem } from '../../components/feature/index';
import { CalendarClock } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

const ExamSchedule = () => {
  const { data: exams = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['exam-schedule', 'me'],
    queryFn: () => getMyExamSchedule(),
  });

  const upcoming = exams.filter(e => new Date(e.examDate) >= new Date());
  const past = exams.filter(e => new Date(e.examDate) < new Date());

  return (
    <div className="animate-fade-in">
      <PageHeader title="Sınav Programım" subtitle="Tüm dönem sınavlarınız" />

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--color-text-secondary)' }}>
        Yaklaşan Sınavlar ({upcoming.length})
      </h3>

      <div className="card" style={{ padding: 0, marginBottom: 24 }}>
        {isLoading ? (
          <TableSkeleton rows={3} cols={4} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !upcoming.length ? (
          <EmptyState icon={CalendarClock} title="Yaklaşan sınav yok" description="Tüm sınavlarınız tamamlandı" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
            {upcoming.map(exam => (
              <ExamListItem key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--color-text-secondary)' }}>
            Geçmiş Sınavlar ({past.length})
          </h3>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
              {past.map(exam => (
                <div key={exam.id} style={{ opacity: 0.6 }}>
                  <ExamListItem exam={exam} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamSchedule;
