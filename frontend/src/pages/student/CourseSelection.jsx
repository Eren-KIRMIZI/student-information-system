import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourseSections } from '../../api/academic.api';
import { createEnrollment } from '../../api/records.api';
import { PageHeader, SearchInput, EmptyState, ErrorState, Pagination, StatusBadge } from '../../components/ui/index';
import { CourseSectionCard } from '../../components/feature/index';
import { DAY_LABEL_SHORT, SEMESTER_LABELS } from '../../utils/constants';
import { BookOpen, Plus, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseSelection = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [enrollingId, setEnrollingId] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['course-sections', 'catalog', page, search],
    queryFn: () => getCourseSections({ page, limit: 12, search }),
  });

  const enrollMutation = useMutation({
    mutationFn: (courseSectionId) => createEnrollment({ courseSectionId }),
    onSuccess: () => {
      toast.success('Ders seçme talebiniz alındı!');
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      setEnrollingId(null);
    },
    onError: (e) => {
      const code = e.response?.data?.code;
      const msg  = e.response?.data?.message;
      if (code === 'QUOTA_FULL')           toast.error('Kontenjan dolu!');
      else if (code === 'ALREADY_ENROLLED') toast.error('Bu derse zaten kayıtlısınız.');
      else if (code === 'ECTS_LIMIT_EXCEEDED') toast.error('AKTS limitinizi aşıyorsunuz!');
      else if (code === 'SCHEDULE_CONFLICT') toast.error('Ders programı çakışması var!');
      else toast.error(msg || 'Kayıt başarısız');
      setEnrollingId(null);
    },
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Ders Seçme" subtitle="Açık ders şubelerine kayıt olabilirsiniz" />

      <div className="filter-bar">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Ders veya kod ara..." />
      </div>

      {isLoading ? (
        <div className="grid-auto-fill">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="card" style={{ height:160 }}><div className="skeleton" style={{ height:'100%', borderRadius:8 }} /></div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.data?.length ? (
        <EmptyState icon={BookOpen} title="Ders bulunamadı" description="Arama kriterlerinizi değiştirin" />
      ) : (
        <>
          <div className="grid-auto-fill" style={{ marginBottom:20 }}>
            {data.data.map(section => {
              const quota     = section.quota;
              const enrolled  = section._count?.enrollments ?? 0;
              const remaining = section.remainingQuota ?? (quota - enrolled);
              const isFull    = remaining <= 0;
              const isEnrolling = enrollingId === section.id;

              return (
                <div key={section.id} className="card" style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{section.course.name}</div>
                    <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>
                      {section.course.code} · {section.course.credit} Kredi · {section.course.ects} AKTS
                    </div>
                  </div>

                  <div style={{ fontSize:13, color:'var(--color-text-secondary)' }}>
                    {section.lecturer
                      ? `${section.lecturer.title ?? ''} ${section.lecturer.firstName} ${section.lecturer.lastName}`.trim()
                      : 'Akademisyen atanmadı'}
                  </div>

                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <StatusBadge status={section.semester} />
                    <span style={{ fontSize:12, display:'inline-flex', alignItems:'center', gap:4, color:'var(--color-text-muted)' }}>
                      <Users size={12} /> {enrolled}/{quota}
                      {isFull && <span style={{ color:'#ef4444', fontWeight:700 }}> (Dolu)</span>}
                    </span>
                  </div>

                  {section.weeklySlots?.length > 0 && (
                    <div style={{ fontSize:12, color:'var(--color-text-muted)', display:'flex', flexWrap:'wrap', gap:4 }}>
                      <Clock size={12} style={{ marginTop:1 }} />
                      {section.weeklySlots.map((s,i) => (
                        <span key={i}>{DAY_LABEL_SHORT[s.dayOfWeek]} {s.startTime}-{s.endTime}</span>
                      )).reduce((a,b)=>[...a, ', ', b])}
                    </div>
                  )}

                  <div style={{ marginTop:'auto' }}>
                    <button
                      className="btn btn-primary"
                      style={{ width:'100%' }}
                      disabled={isFull || isEnrolling || enrollMutation.isPending}
                      onClick={() => { setEnrollingId(section.id); enrollMutation.mutate(section.id); }}
                    >
                      {isEnrolling ? <span className="spinner" /> : <Plus size={15} />}
                      {isFull ? 'Kontenjan Dolu' : isEnrolling ? 'Kaydediliyor...' : 'Derse Kaydol'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination {...data.pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default CourseSelection;
