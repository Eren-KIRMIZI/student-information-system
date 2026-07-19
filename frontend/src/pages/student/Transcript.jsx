import { useQuery } from '@tanstack/react-query';
import { getMyTranscript } from '../../api/records.api';
import { PageHeader, TableSkeleton, ErrorState, EmptyState } from '../../components/ui/index';
import { FileText, Award, BookOpen, GraduationCap } from 'lucide-react';

const gradeColor = { FF:'#ef4444', FD:'#f97316', DD:'#f59e0b', DC:'#eab308', CC:'#84cc16', CB:'#22c55e', BB:'#10b981', BA:'#14b8a6', AA:'#2563eb' };

const Transcript = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['transcript', 'me'],
    queryFn: getMyTranscript,
  });

  const groupedBySemester = {};
  if (data?.grades) {
    data.grades.forEach(g => {
      const section = g.enrollment.courseSection;
      const key = `${section.academicYear} ${section.semester}`;
      if (!groupedBySemester[key]) groupedBySemester[key] = [];
      groupedBySemester[key].push(g);
    });
  }

  const semesterLabel = { FALL:'Güz', SPRING:'Bahar', SUMMER:'Yaz' };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transkriptim"
        subtitle="Tüm dönemlere ait akademik geçmişiniz"
        action={
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <FileText size={15} /> PDF Olarak İndir
          </button>
        }
      />

      {/* Summary cards */}
      {!isLoading && data && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16, marginBottom:24 }}>
          <div className="card" style={{ textAlign:'center' }}>
            <Award size={28} color="#2563eb" style={{ margin:'0 auto 8px' }} />
            <div style={{ fontSize:28, fontWeight:800, color:'#2563eb' }}>{data.gpa?.toFixed(2) ?? '—'}</div>
            <div style={{ fontSize:13, color:'var(--color-text-muted)', fontWeight:500 }}>Genel Not Ortalaması</div>
          </div>
          <div className="card" style={{ textAlign:'center' }}>
            <BookOpen size={28} color="#7c3aed" style={{ margin:'0 auto 8px' }} />
            <div style={{ fontSize:28, fontWeight:800, color:'#7c3aed' }}>{data.totalCredits ?? 0}</div>
            <div style={{ fontSize:13, color:'var(--color-text-muted)', fontWeight:500 }}>Toplam Kredi</div>
          </div>
          <div className="card" style={{ textAlign:'center' }}>
            <GraduationCap size={28} color="#059669" style={{ margin:'0 auto 8px' }} />
            <div style={{ fontSize:28, fontWeight:800, color:'#059669' }}>{data.grades?.length ?? 0}</div>
            <div style={{ fontSize:13, color:'var(--color-text-muted)', fontWeight:500 }}>Tamamlanan Ders</div>
          </div>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.grades?.length ? (
        <EmptyState icon={FileText} title="Transkript verisi yok" description="Henüz kesinleşmiş notunuz bulunmuyor" />
      ) : (
        Object.entries(groupedBySemester).map(([key, grades]) => {
          const [year, sem] = key.split(' ');
          const semGpa = (() => {
            const pts = grades.reduce((s, g) => s + ((g.gradePoint ?? 0) * g.enrollment.courseSection.course.credit), 0);
            const cr  = grades.reduce((s, g) => s + g.enrollment.courseSection.course.credit, 0);
            return cr > 0 ? (pts / cr).toFixed(2) : '—';
          })();
          return (
            <div key={key} className="card" style={{ marginBottom:16, padding:0 }}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--color-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ margin:0, fontWeight:700, fontSize:15 }}>
                  {year} — {semesterLabel[sem] ?? sem} Dönemi
                </h3>
                <div style={{ display:'flex', gap:16, fontSize:13, color:'var(--color-text-muted)' }}>
                  <span>Dönem Ort: <strong style={{ color:'var(--color-text-primary)' }}>{semGpa}</strong></span>
                </div>
              </div>
              <div className="table-container" style={{ border:'none', borderRadius:0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ders</th>
                      <th>Kredi</th>
                      <th style={{ textAlign:'center' }}>Vize</th>
                      <th style={{ textAlign:'center' }}>Final</th>
                      <th style={{ textAlign:'center' }}>Harf Notu</th>
                      <th style={{ textAlign:'center' }}>Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map(g => {
                      const letter = g.letterGrade;
                      return (
                        <tr key={g.id}>
                          <td>
                            <div style={{ fontWeight:600 }}>{g.enrollment.courseSection.course.name}</div>
                            <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>{g.enrollment.courseSection.course.code}</div>
                          </td>
                          <td>{g.enrollment.courseSection.course.credit}</td>
                          <td style={{ textAlign:'center' }}>{g.midtermScore ?? '—'}</td>
                          <td style={{ textAlign:'center' }}>{g.makeupScore ?? g.finalScore ?? '—'}</td>
                          <td style={{ textAlign:'center' }}>
                            {letter ? (
                              <span style={{
                                display:'inline-block', padding:'2px 10px', borderRadius:20,
                                fontWeight:800, fontSize:13,
                                background:(gradeColor[letter]||'#94a3b8')+'22',
                                color:gradeColor[letter]||'#94a3b8',
                              }}>{letter}</span>
                            ) : '—'}
                          </td>
                          <td style={{ textAlign:'center', fontWeight:700 }}>{g.gradePoint?.toFixed(1) ?? '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Transcript;
