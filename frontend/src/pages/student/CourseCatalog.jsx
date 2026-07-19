import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCourseSections } from '../../api/academic.api';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader, SearchInput, StatusBadge, TableSkeleton, CardSkeleton,
  EmptyState, ErrorState, Pagination,
} from '../../components/ui/index';
import { CourseSectionCard } from '../../components/feature/index';
import { SEMESTER_OPTIONS } from '../../utils/constants';
import { ACADEMIC_YEAR_OPTIONS } from '../../utils/constants';
import { BookOpen, ArrowRight } from 'lucide-react';

const CourseCatalog = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [academicYear, setAcademicYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['catalog-sections', page, search, academicYear, semester],
    queryFn: () => getCourseSections({
      page, limit: 20, search,
      academicYear: academicYear || undefined,
      semester: semester || undefined,
    }),
  });

  const sections = data?.data ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ders Kataloğu"
        subtitle="Açık ders şubelerini inceleyin"
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
          {ACADEMIC_YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          className="input"
          style={{ width: 'auto', minWidth: 130 }}
          value={semester}
          onChange={(e) => { setSemester(e.target.value); setPage(1); }}
        >
          <option value="">Tüm Yarıyıllar</option>
          {SEMESTER_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        viewMode === 'card' ? <CardSkeleton count={8} /> : <div className="card" style={{ padding: 0 }}><TableSkeleton rows={8} cols={6} /></div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !sections.length ? (
        <div className="card">
          <EmptyState icon={BookOpen} title="Ders bulunamadı" description="Seçtiğiniz döneme ait açık ders şubesi bulunmuyor." />
        </div>
      ) : viewMode === 'card' ? (
        <>
          <div className="grid-auto-fill">
            {sections.map((s) => (
              <CourseSectionCard
                key={s.id}
                section={s}
                onClick={() => navigate('/student/course-selection')}
              />
            ))}
          </div>
          {data?.pagination && (
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
                  <th>Akademisyen</th>
                  <th>Şube</th>
                  <th>Dönem</th>
                  <th>Kredi / AKTS</th>
                  <th>Kontenjan</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => {
                  const remaining = s.remainingQuota ?? 0;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.course?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.course?.code}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {s.lecturer ? `${s.lecturer.firstName} ${s.lecturer.lastName}` : '—'}
                      </td>
                      <td><span className="badge badge-blue">{s.sectionCode}</span></td>
                      <td>
                        <div style={{ fontSize: 13 }}>{s.academicYear}</div>
                        <StatusBadge status={s.semester} />
                      </td>
                      <td style={{ fontSize: 13 }}>{s.course?.credits} / {s.course?.ects}</td>
                      <td>
                        <span style={{ color: remaining <= 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                          {remaining}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}> / {s.quota}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate('/student/course-selection')}
                          title="Ders Seçimine Git"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination {...data.pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
