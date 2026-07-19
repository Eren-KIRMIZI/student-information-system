import { useQuery } from '@tanstack/react-query';
import { getMyWeeklySchedule } from '../../api/system.api';
import { PageHeader, EmptyState, ErrorState } from '../../components/ui/index';
import { ScheduleGrid } from '../../components/feature/index';
import { CalendarDays } from 'lucide-react';

const MyTeachingSchedule = () => {
  const { data: slots = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['weekly-schedule', 'me', 'academician'],
    queryFn: getMyWeeklySchedule,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Haftalık Programım" subtitle="Sorumlu olduğunuz derslerin haftalık takvimi" />

      {isLoading ? (
        <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !slots.length ? (
        <EmptyState icon={CalendarDays} title="Program bulunamadı" description="Bu dönem aktif ders saatiniz görünmüyor." />
      ) : (
        <ScheduleGrid slots={slots} />
      )}
    </div>
  );
};

export default MyTeachingSchedule;
