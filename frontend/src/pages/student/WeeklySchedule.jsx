import { useQuery } from '@tanstack/react-query';
import { getMyWeeklySchedule } from '../../api/system.api';
import { PageHeader, EmptyState, ErrorState } from '../../components/ui/index';
import { ScheduleGrid } from '../../components/feature/index';
import { CalendarDays } from 'lucide-react';

const WeeklySchedule = () => {
  const { data: slots = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['weekly-schedule', 'me'],
    queryFn: getMyWeeklySchedule,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Haftalık Ders Programım" subtitle="Bu dönemdeki ders programınız" />

      {isLoading ? (
        <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !slots.length ? (
        <EmptyState icon={CalendarDays} title="Program bulunamadı" description="Kayıtlı aktif dersiniz yok ya da program henüz girilmemiş" />
      ) : (
        <ScheduleGrid slots={slots} />
      )}
    </div>
  );
};

export default WeeklySchedule;
