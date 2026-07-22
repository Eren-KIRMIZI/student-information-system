import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseSection } from '../../api/academic.api';
import { getSectionMaterials, downloadMaterial } from '../../api/material.api';
import { PageHeader, Skeleton, ErrorState, Tabs, EmptyState } from '../../components/ui/index';
import { ArrowLeft, BookOpen, FileText, Download, Eye } from 'lucide-react';
import dayjs from 'dayjs';
import io from 'socket.io-client';

// ===== Materials Tab =====
const MaterialsTab = ({ sectionId }) => {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['student-section-materials', sectionId],
    queryFn: () => getSectionMaterials(sectionId),
  });

  const materials = response?.data || [];

  const handleDownload = async (m) => {
    try {
      await downloadMaterial(m.id);
      window.open(`http://localhost:5000${m.fileUrl}`, '_blank');
      refetch(); // Refresh count
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <Skeleton height={200} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      {!materials.length ? (
        <EmptyState icon={FileText} title="Henüz materyal yüklenmemiş" />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Materyal Adı</th>
                <th>Açıklama</th>
                <th>Hafta</th>
                <th>Boyut</th>
                <th>Yükleyen</th>
                <th>Tarih</th>
                <th style={{ width: 100 }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-primary)' }}>{m.originalFileName}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{m.description || '—'}</td>
                  <td style={{ fontSize: 13 }}>{m.week ? `${m.week}. Hafta` : '—'}</td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {m.fileSize ? `${(m.fileSize / 1024).toFixed(1)} KB` : '—'}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {m.uploader?.lecturer ? `${m.uploader.lecturer.firstName} ${m.uploader.lecturer.lastName}` : '—'}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {dayjs(m.createdAt).format('DD.MM.YYYY HH:mm')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['application/pdf', 'image/jpeg', 'image/png'].includes(m.fileType) && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDownload(m)} title="Önizle">
                          <Eye size={14} />
                        </button>
                      )}
                      <button className="btn btn-primary btn-sm" onClick={() => handleDownload(m)} title="İndir">
                        <Download size={14} />{' '}
                        {m.downloadCount > 0 && (
                          <span style={{ marginLeft: 4, opacity: 0.8 }}>({m.downloadCount})</span>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ===== Main Workspace =====
const StudentCourseSectionWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('materials');

  const {
    data: section,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['course-section', id],
    queryFn: () => getCourseSection(id),
  });

  const TABS = [
    { id: 'materials', label: 'Materyaller' },
    { id: 'assignments', label: 'Ödevler' },
    { id: 'announcements', label: 'Duyurular' },
  ];

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Ders Sayfası" />
        <div className="card">
          <Skeleton height={400} />
        </div>
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${section.course?.code} — ${section.sectionCode}`}
        subtitle={`${section.course?.name} · ${section.academicYear} ${section.semester}`}
        action={
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Geri
          </button>
        }
      />

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--color-border)' }}>
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>
        <div style={{ padding: 24 }}>
          {activeTab === 'materials' && <MaterialsTab sectionId={id} />}
          {activeTab === 'assignments' && <EmptyState icon={BookOpen} title="Ödevler Modülü Yakında" />}
          {activeTab === 'announcements' && <EmptyState icon={BookOpen} title="Duyurular Modülü Yakında" />}
        </div>
      </div>
    </div>
  );
};

export default StudentCourseSectionWorkspace;
