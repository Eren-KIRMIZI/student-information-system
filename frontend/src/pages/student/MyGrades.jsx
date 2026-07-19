import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyEnrollments } from '../../api/records.api';
import { PageHeader, TableSkeleton, EmptyState, ErrorState, Tabs } from '../../components/ui/index';
import { GradeBadge } from '../../components/feature/index';
import { BookOpen } from 'lucide-react';

const MyGrades = () => {
  const [tab, setTab] = useState('active');

  const { data: enrollments, isLoading, isError, refetch } = useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: getMyEnrollments,
  });

  const active    = enrollments?.filter(e => ['ACTIVE','APPROVED'].includes(e.status)) ?? [];
  const completed = enrollments?.filter(e => e.status === 'COMPLETED') ?? [];
  const current   = tab === 'active' ? active : completed;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Notlarım" subtitle="Dönemlik ders notlarınız" />

      <Tabs
        tabs={[
          { id: 'active',    label: 'Aktif Dersler', badge: active.length },
          { id: 'completed', label: 'Geçmiş Dersler', badge: completed.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="card" style={{ marginTop: 20, padding: 0 }}>
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !current.length ? (
          <EmptyState icon={BookOpen} title="Kayıt bulunamadı" description={tab === 'active' ? 'Aktif ders kaydınız yok' : 'Geçmiş ders kaydınız yok'} />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ders</th>
                  <th>Akademisyen</th>
                  <th style={{ textAlign:'center' }}>Vize</th>
                  <th style={{ textAlign:'center' }}>Final</th>
                  <th style={{ textAlign:'center' }}>Harf Notu</th>
                  <th style={{ textAlign:'center' }}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {current.map(e => {
                  const g = e.grade;
                  const letter = g?.letterGrade;
                  return (
                    <tr key={e.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{e.courseSection.course.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {e.courseSection.course.code} · {e.courseSection.course.credit} Kredi
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {e.courseSection.lecturer
                          ? `${e.courseSection.lecturer.title ?? ''} ${e.courseSection.lecturer.firstName} ${e.courseSection.lecturer.lastName}`.trim()
                          : '—'}
                      </td>
                      <td style={{ textAlign:'center', fontWeight:600 }}>{g?.midtermScore ?? '—'}</td>
                      <td style={{ textAlign:'center', fontWeight:600 }}>{g?.makeupScore ?? g?.finalScore ?? '—'}</td>
                      <td style={{ textAlign:'center' }}>
                        <GradeBadge letter={letter} />
                      </td>
                      <td style={{ textAlign:'center' }}>
                        {g?.isFinalized
                          ? <span className="badge badge-green">Kesinleşti</span>
                          : g ? <span className="badge badge-yellow">Taslak</span>
                          : <span className="badge badge-gray">Girilmedi</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGrades;
