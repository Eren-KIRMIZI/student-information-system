import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCourseSections } from '../../api/academic.api';
import { getLecturers } from '../../api/people.api';
import {
  PageHeader, StatusBadge, TableSkeleton, CardSkeleton,
  EmptyState, ErrorState, Pagination, SearchInput,
} from '../../components/ui/index';
import { BookOpen, Users, ArrowRight, Layers } from 'lucide-react';

const SEMESTERS = ['FALL', 'SPRING', 'SUMMER'];
const SEM_LABELS = { FALL: 'Güz', SPRING: 'Bahar', SUMMER: 'Yaz' };

const MyCourseSections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'table' | 'card'

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 4 }, (_, i) => {
    const y = currentYear - 1 + i;
    return `${y}-${y + 1}`;
  });
  const [academicYear, setAcademicYear] = useState(`${currentYear}-${currentYear + 1}`);

  // Get the lecturer record for this user
  const { data: lecturerData } = useQuery({
    queryKey: ['lecturers-mine'],
    queryFn: () => getLecturers({ limit: 1 }),
  });

  const lecturerId = user?.lecturerId ?? lecturerData?.data?.[0]?.id;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-course-sections', page, search, academicYear, semester, lecturerId],
    queryFn: () => getCourseSections({
      page, limit: 20, search,
      academicYear: academicYear || undefined,
      semester: semester || undefined,
      lecturerId,
    }),
    enabled: !!lecturerId,
  });

  const sections = data?.data ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Verdiğim Dersler"
        subtitle="Sorumlu olduğunuz ders şubeleri ve çalışma alanları"
        action={
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('table')}
            >
              Liste
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('card')}
            >
              Kart
            </button>
          </div>
        }
      />

      <div className="filter-bar">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Ders adı veya kodu ara..."
        />
        <select
          className="input"
          style={{ width: 'auto', minWidth: 150 }}
          value={academicYear}
          onChange={(e) => { setAcademicYear(e.target.value); setPage(1); }}
        >
          <option value="">Tüm Yıllar</option>
          {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          className="input"
          style={{ width: 'auto', minWidth: 130 }}
          value={semester}
          onChange={(e) => { setSemester(e.target.value); setPage(1); }}
        >
          <option value="">Tüm Yarıyıllar</option>
          {SEMESTERS.map((s) => <option key={s} value={s}>{SEM_LABELS[s]}</option>)}
        </select>
      </div>

      {!lecturerId || isLoading ? (
        viewMode === 'card' ? <CardSkeleton count={4} /> : <div className="card" style={{ padding: 0 }}><TableSkeleton rows={5} cols={6} /></div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !sections.length ? (
        <div className="card">
          <EmptyState
            icon={Layers}
            title="Ders şubesi bulunamadı"
            description="Filtreleme kriterlerine uygun sorumlu olduğunuz bir ders şubesi bulunmuyor."
          />
        </div>
      ) : viewMode === 'card' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {sections.map((s) => {
              const enrolled = s._count?.enrollments ?? 0;
              return (
                <div
                  key={s.id}
                  className="card"
                  style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onClick={() => navigate(`/academician/course-sections/${s.id}`)}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span className="badge badge-blue">{s.course?.code}</span>
                    <StatusBadge status={s.semester} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, lineHeight: 1.4 }}>{s.course?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>
                    Şube {s.sectionCode} · {s.academicYear}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                    <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={14} /> {enrolled} Kayıtlı Öğrenci
                    </span>
                    <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
                  </div>
                </div>
              );
            })}
          </div>
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div style={{ marginTop: 16 }}>
              <div className="card" style={{ padding: 0 }}>
                <Pagination {...data.pagination} onPageChange={setPage} />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ders</th>
                  <th>Şube</th>
                  <th>Dönem</th>
                  <th>Kayıtlı Öğrenci</th>
                  <th style={{ width: 100 }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => {
                  const enrolled = s._count?.enrollments ?? 0;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.course?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.course?.code}</div>
                      </td>
                      <td><span className="badge badge-blue">{s.sectionCode}</span></td>
                      <td>
                        <div style={{ fontSize: 13 }}>{s.academicYear}</div>
                        <StatusBadge status={s.semester} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                          <Users size={14} style={{ color: 'var(--color-text-muted)' }} />
                          <span style={{ fontWeight: 600 }}>{enrolled}</span>
                          <span style={{ color: 'var(--color-text-muted)' }}>/ {s.quota}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/academician/course-sections/${s.id}`)}
                          title="Çalışma Alanına Git"
                        >
                          Workspace <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data?.pagination && data.pagination.totalPages > 1 && (
            <Pagination {...data.pagination} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  );
};

export default MyCourseSections;
