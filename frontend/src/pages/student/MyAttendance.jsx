import { useQuery } from '@tanstack/react-query';
import { getMyAttendance } from '../../api/records.api';
import { PageHeader, StatusBadge, TableSkeleton, EmptyState, ErrorState } from '../../components/ui/index';
import { AttendanceProgressBar } from '../../components/feature/index';
import { ClipboardCheck } from 'lucide-react';
import dayjs from 'dayjs';
import { useAttendanceSocket } from '../../hooks/useSocket';

const MyAttendance = () => {
  useAttendanceSocket();
  const {
    data: records = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: getMyAttendance,
  });

  const grouped = records.reduce((acc, r) => {
    const sec = r.enrollment?.courseSection;
    if (!sec) return acc;
    const key = sec.id;
    if (!acc[key]) {
      acc[key] = { section: sec, records: [] };
    }
    acc[key].records.push(r);
    return acc;
  }, {});

  const groups = Object.values(grouped);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Devamsızlık Durumum" subtitle="Ders bazlı devamsızlık özetiniz" />

      {isLoading ? (
        <div className="card" style={{ padding: 0 }}>
          <TableSkeleton rows={6} cols={5} />
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !groups.length ? (
        <div className="card">
          <EmptyState
            icon={ClipboardCheck}
            title="Devamsızlık kaydı bulunamadı"
            description="Henüz herhangi bir ders için devamsızlık kaydı girilmemiş."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {groups.map((g) => (
            <div key={g.section.id} className="card" style={{ padding: 0 }}>
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{g.section.course?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {g.section.course?.code} · Şube {g.section.sectionCode} · {g.section.academicYear}
                  </div>
                </div>
              </div>

              <AttendanceProgressBar records={g.records} />

              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.records.slice(0, 10).map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontSize: 13 }}>{dayjs(r.date).format('DD MMMM YYYY, dddd')}</td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                    {g.records.length > 10 && (
                      <tr>
                        <td
                          colSpan={2}
                          style={{
                            textAlign: 'center',
                            fontSize: 13,
                            color: 'var(--color-text-muted)',
                            padding: '8px 0',
                          }}
                        >
                          + {g.records.length - 10} kayıt daha
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAttendance;
