import { useQuery } from '@tanstack/react-query';
import { getMyAttendance } from '../../api/records.api';
import { PageHeader, StatusBadge, TableSkeleton, EmptyState, ErrorState } from '../../components/ui/index';
import { ClipboardCheck } from 'lucide-react';
import dayjs from 'dayjs';

const MyAttendance = () => {
  const { data: records = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: getMyAttendance,
  });

  // Group by courseSection
  const grouped = records.reduce((acc, r) => {
    const sec = r.enrollment?.courseSection;
    if (!sec) return acc;
    const key = sec.id;
    if (!acc[key]) {
      acc[key] = {
        section: sec,
        records: [],
        present: 0,
        absent: 0,
        excused: 0,
      };
    }
    acc[key].records.push(r);
    if (r.status === 'PRESENT') acc[key].present++;
    else if (r.status === 'ABSENT') acc[key].absent++;
    else if (r.status === 'EXCUSED') acc[key].excused++;
    return acc;
  }, {});

  const groups = Object.values(grouped);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Devamsızlık Durumum"
        subtitle="Ders bazlı devamsızlık özetiniz"
      />

      {isLoading ? (
        <div className="card" style={{ padding: 0 }}><TableSkeleton rows={6} cols={5} /></div>
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
          {groups.map((g) => {
            const total = g.present + g.absent + g.excused;
            const absencePct = total > 0 ? Math.round(((g.absent) / total) * 100) : 0;
            const isRisky = absencePct >= 30;

            return (
              <div key={g.section.id} className="card" style={{ padding: 0 }}>
                {/* Course Header */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{g.section.course?.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {g.section.course?.code} · Şube {g.section.sectionCode} · {g.section.academicYear}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-success)' }}>{g.present}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Katıldı</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-danger)' }}>{g.absent}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Devamsız</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-warning)' }}>{g.excused}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>İzinli</div>
                      </div>
                    </div>
                    {isRisky && (
                      <span className="badge badge-red" style={{ fontSize: 11 }}>
                        ⚠️ Devamsızlık sınırına yakın ({absencePct}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Devamsızlık progress bar */}
                <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    <span>Devamsızlık oranı</span>
                    <span style={{ fontWeight: 600, color: isRisky ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>%{absencePct}</span>
                  </div>
                  <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 6 }}>
                    <div style={{
                      width: `${absencePct}%`,
                      height: '100%',
                      background: isRisky ? 'var(--color-danger)' : absencePct >= 20 ? 'var(--color-warning)' : 'var(--color-success)',
                      borderRadius: 4,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>

                {/* Kayıt tablosu */}
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
                          <td><StatusBadge status={r.status} /></td>
                        </tr>
                      ))}
                      {g.records.length > 10 && (
                        <tr>
                          <td colSpan={2} style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)', padding: '8px 0' }}>
                            + {g.records.length - 10} kayıt daha
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAttendance;
