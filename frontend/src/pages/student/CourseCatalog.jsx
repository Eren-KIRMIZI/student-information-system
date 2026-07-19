import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCourseSections } from '../../api/academic.api';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader, SearchInput, StatusBadge, TableSkeleton, CardSkeleton,
  EmptyState, ErrorState, Pagination,
} from '../../components/ui/index';
import { BookOpen, Users, ArrowRight } from 'lucide-react';

const SEMESTERS = ['FALL', 'SPRING', 'SUMMER'];
const SEM_LABELS = { FALL: 'Güz', SPRING: 'Bahar', SUMMER: 'Yaz' };

const CourseCatalog = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 4 }, (_, i) => {
    const y = currentYear - 1 + i;
    return `${y}-${y + 1}`;
  });
  const [academicYear, setAcademicYear] = useState(`${currentYear}-${currentYear + 1}`);

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {sections.map((s) => {
              const remaining = s.remainingQuota ?? 0;
              const isFull = remaining <= 0;
              const fillPct = Math.round(((s.quota - remaining) / s.quota) * 100);
              return (
                <div
                  key={s.id}
                  className="card"
                  style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onClick={() => navigate('/student/course-selection')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span className="badge badge-blue">{s.course?.code}</span>
                    <StatusBadge status={s.semester} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, lineHeight: 1.4 }}>{s.course?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                    {s.lecturer ? `${s.lecturer.firstName} ${s.lecturer.lastName}` : '—'} · Şube {s.sectionCode}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      <Users size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {s.quota - remaining}/{s.quota} kayıtlı
                    </span>
                    <span style={{ color: isFull ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                      {isFull ? 'Dolu' : `${remaining} boş`}
                    </span>
                  </div>
                  <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${fillPct}%`, height: '100%', background: isFull ? 'var(--color-danger)' : 'var(--color-primary)', borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
                    <span>{s.course?.credits} kr</span>
                    <span>·</span>
                    <span>{s.course?.ects} AKTS</span>
                    <span>·</span>
                    <span>{s.course?.department?.name}</span>
                  </div>
                </div>
              );
            })}
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
