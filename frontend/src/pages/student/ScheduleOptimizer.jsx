import { useQuery } from '@tanstack/react-query';
import { getScheduleConflicts } from '../../api/advanced.api';
import { PageHeader, CardSkeleton, ErrorState, EmptyState } from '../../components/ui/index';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const dayLabels = { MONDAY: 'Pazartesi', TUESDAY: 'Salı', WEDNESDAY: 'Çarşamba', THURSDAY: 'Perşembe', FRIDAY: 'Cuma' };

const ScheduleOptimizer = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['schedule-optimizer'],
    queryFn: getScheduleConflicts,
  });

  if (isLoading) return <CardSkeleton count={3} />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Program Analizi" subtitle="Ders programınızı analiz edin, çakışmaları ve boş saatleri görün" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <Calendar size={28} color="#2563eb" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb' }}>{data.enrolledSections?.length || 0}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Kayıtlı Ders</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <AlertTriangle size={28} color={data.conflicts?.length ? '#dc2626' : '#059669'} style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: data.conflicts?.length ? '#dc2626' : '#059669' }}>{data.conflicts?.length || 0}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Çakışma</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <Clock size={28} color="#7c3aed" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>{data.freeSlots?.length || 0}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Boş Saat</div>
        </div>
      </div>

      {data.conflicts?.length > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 20, borderLeft: '4px solid #dc2626' }}>
          <h3 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
            <AlertTriangle size={18} /> Çakışmalar
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.conflicts.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{c.slot1.courseCode}</span>
                <span>{dayLabels[c.slot1.dayOfWeek]} {c.slot1.startTime}-{c.slot1.endTime}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>&</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{c.slot2.courseCode}</span>
                <span>{dayLabels[c.slot2.dayOfWeek]} {c.slot2.startTime}-{c.slot2.endTime}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!data.conflicts?.length && (
        <div className="card" style={{ padding: 16, marginBottom: 20, borderLeft: '4px solid #059669', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckCircle size={20} color="#059669" />
          <span style={{ fontWeight: 600, color: '#059669' }}>Programınızda çakışma bulunmuyor!</span>
        </div>
      )}

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 15 }}>
          <Clock size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> Boş Saatler
        </h3>
        {data.freeSlots?.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.freeSlots.map((s, i) => (
              <span key={i} style={{ padding: '6px 12px', background: 'var(--color-bg-secondary)', borderRadius: 8, fontSize: 12, fontWeight: 500 }}>
                {dayLabels[s.dayOfWeek]} {s.startTime}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Tüm saatler dolu.</p>
        )}
      </div>
    </div>
  );
};

export default ScheduleOptimizer;
