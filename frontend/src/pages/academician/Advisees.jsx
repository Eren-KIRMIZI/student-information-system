import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getAdviseesByLecturer } from '../../api/system.api';
import { getEnrollments, approveEnrollment, rejectEnrollment } from '../../api/records.api';
import { getLecturers } from '../../api/people.api';
import {
  PageHeader, StatusBadge, TableSkeleton, EmptyState, ErrorState, Tabs,
} from '../../components/ui/index';
import { PersonRow } from '../../components/feature/index';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PendingApprovalsTab = ({ lecturerId }) => {
  const qc = useQueryClient();

  const { data: advisees = [], isLoading: advLoading } = useQuery({
    queryKey: ['advisees', lecturerId],
    queryFn: () => getAdviseesByLecturer(lecturerId),
    enabled: !!lecturerId,
  });

  const adviseeIds = advisees.map((s) => s.id);

  const { data: enrollData, isLoading: enLoading, isError, refetch } = useQuery({
    queryKey: ['pending-enrollments', lecturerId],
    queryFn: () => getEnrollments({ status: 'PENDING', limit: 100 }),
    enabled: adviseeIds.length > 0,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => approveEnrollment(id),
    onSuccess: () => {
      toast.success('Kayıt onaylandı');
      qc.invalidateQueries({ queryKey: ['pending-enrollments', lecturerId] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Onaylanamadı'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => rejectEnrollment(id),
    onSuccess: () => {
      toast.success('Kayıt reddedildi');
      qc.invalidateQueries({ queryKey: ['pending-enrollments', lecturerId] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Reddedilemedi'),
  });

  if (advLoading || enLoading) return <TableSkeleton rows={4} cols={5} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const pendingEnrollments = (enrollData?.data ?? []).filter((e) =>
    adviseeIds.includes(e.student?.id ?? e.studentId)
  );

  if (!pendingEnrollments.length) {
    return (
      <EmptyState
        icon={CheckCircle}
        title="Onay bekleyen kayıt yok"
        description="Danışmanlık öğrencilerinizin tüm ders kayıtları onaylanmış."
      />
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Öğrenci</th>
            <th>Ders</th>
            <th>Şube</th>
            <th>Dönem</th>
            <th style={{ width: 140 }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {pendingEnrollments.map((e) => (
            <tr key={e.id}>
              <td>
                <PersonRow
                  firstName={e.student?.firstName}
                  lastName={e.student?.lastName}
                  subtitle={e.student?.studentNumber}
                />
              </td>
              <td>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{e.courseSection?.course?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{e.courseSection?.course?.code}</div>
              </td>
              <td><span className="badge badge-blue">{e.courseSection?.sectionCode}</span></td>
              <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {e.courseSection?.academicYear}
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--color-success)', color: '#fff', gap: 4 }}
                    onClick={() => approveMutation.mutate(e.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <CheckCircle size={13} /> Onayla
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => rejectMutation.mutate(e.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <XCircle size={13} /> Reddet
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdviseesTab = ({ lecturerId }) => {
  const { data: students = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['advisees', lecturerId],
    queryFn: () => getAdviseesByLecturer(lecturerId),
    enabled: !!lecturerId,
  });

  if (isLoading) return <TableSkeleton rows={5} cols={4} />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!students.length) return <EmptyState icon={Users} title="Henüz danışmanlık öğrenciniz yok" />;

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Öğrenci</th>
            <th>Numara</th>
            <th>Bölüm</th>
            <th>Sınıf</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>
                <PersonRow
                  firstName={s.firstName}
                  lastName={s.lastName}
                  email={s.user?.email}
                  subtitle={s.studentNumber}
                />
              </td>
              <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{s.department?.name ?? '—'}</td>
              <td style={{ fontSize: 13 }}>{s.classYear}. Sınıf</td>
              <td><StatusBadge status={s.user?.isActive} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Advisees = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');

  const { data: lecturerData } = useQuery({
    queryKey: ['lecturers-mine'],
    queryFn: () => getLecturers({ limit: 1 }),
  });

  const lecturerId = user?.lecturerId ?? lecturerData?.data?.[0]?.id;

  const TABS = [
    { id: 'pending', label: 'Onay Bekleyenler' },
    { id: 'all', label: 'Tüm Danışmanlarım' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Danışman Öğrencilerim"
        subtitle="Danışmanlık öğrencilerinin ders kayıtlarını yönetin"
      />

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--color-border)' }}>
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>
        <div style={{ padding: 24 }}>
          {activeTab === 'pending' && <PendingApprovalsTab lecturerId={lecturerId} />}
          {activeTab === 'all' && <AdviseesTab lecturerId={lecturerId} />}
        </div>
      </div>
    </div>
  );
};

export default Advisees;
