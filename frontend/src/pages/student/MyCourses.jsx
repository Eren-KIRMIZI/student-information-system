import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyEnrollments } from '../../api/records.api';
import {
  PageHeader,
  StatusBadge,
  TableSkeleton,
  CardSkeleton,
  EmptyState,
  ErrorState,
  Pagination,
  SearchInput,
} from '../../components/ui/index';
import { CourseSectionCard } from '../../components/feature/index';
import { SEMESTERS, SEMESTER_LABELS, ACADEMIC_YEAR_OPTIONS } from '../../utils/constants';
import { ArrowRight, Layers } from 'lucide-react';

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [academicYear, setAcademicYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-enrollments', page, search, academicYear, semester, user?.studentId],
    queryFn: () =>
      getMyEnrollments({
        page,
        limit: 20,
        search,
        academicYear: academicYear || undefined,
        semester: semester || undefined,
      }),
    enabled: !!user?.studentId,
  });

  const enrollments = data?.data ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Derslerim"
        subtitle="Kayıtlı olduğunuz dersler ve materyalleri"
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
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Ders ara..."
        />
        <select
          className="input"
          style={{ width: 'auto', minWidth: 150 }}
          value={academicYear}
          onChange={(e) => {
            setAcademicYear(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tüm Yıllar</option>
          {ACADEMIC_YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          className="input"
          style={{ width: 'auto', minWidth: 130 }}
          value={semester}
          onChange={(e) => {
            setSemester(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tüm Yarıyıllar</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>
              {SEMESTER_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        viewMode === 'card' ? (
          <CardSkeleton count={4} />
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <TableSkeleton rows={5} cols={5} />
          </div>
        )
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !enrollments.length ? (
        <div className="card">
          <EmptyState icon={Layers} title="Ders bulunamadı" description="Kayıtlı olduğunuz bir ders bulunmuyor." />
        </div>
      ) : viewMode === 'card' ? (
        <>
          <div className="grid-auto-fill">
            {enrollments.map((e) => (
              <CourseSectionCard
                key={e.id}
                section={e.courseSection}
                onClick={() => navigate(`/student/courses/${e.courseSection.id}`)}
                actionLabel="Ders Sayfası"
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
                  <th>Akademisyen</th>
                  <th style={{ width: 100 }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const s = e.courseSection;
                  return (
                    <tr key={e.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.course?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.course?.code}</div>
                      </td>
                      <td>
                        <span className="badge badge-blue">{s.sectionCode}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{s.academicYear}</div>
                        <StatusBadge status={s.semester} />
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {s.lecturer?.firstName} {s.lecturer?.lastName}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/student/courses/${s.id}`)}
                          title="Ders Sayfasına Git"
                        >
                          Sayfa <ArrowRight size={14} />
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

export default MyCourses;
