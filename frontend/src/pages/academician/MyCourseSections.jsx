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
import { CourseSectionCard } from '../../components/feature/index';
import { SEMESTERS, SEMESTER_LABELS, ACADEMIC_YEAR_OPTIONS } from '../../utils/constants';
import { Users, ArrowRight, Layers } from 'lucide-react';

const MyCourseSections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [viewMode, setViewMode] = useState('card');

  const [academicYear, setAcademicYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);

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
          {ACADEMIC_YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          className="input"
          style={{ width: 'auto', minWidth: 130 }}
          value={semester}
          onChange={(e) => { setSemester(e.target.value); setPage(1); }}
        >
          <option value="">Tüm Yarıyıllar</option>
          {SEMESTERS.map((s) => <option key={s} value={s}>{SEMESTER_LABELS[s]}</option>)}
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
          <div className="grid-auto-fill">
            {sections.map((s) => (
              <CourseSectionCard
                key={s.id}
                section={s}
                onClick={() => navigate(`/academician/course-sections/${s.id}`)}
                actionLabel="Workspace"
              />
            ))}
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
