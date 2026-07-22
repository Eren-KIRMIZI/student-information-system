import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateQRToken, getActiveQRToken, getRecentQRScans, deactivateQRToken } from '../../api/advanced.api';
import { getSectionsByLecturer } from '../../api/academic.api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, CardSkeleton, ErrorState, EmptyState } from '../../components/ui/index';
import { QrCode, RefreshCw, XCircle, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const QRGenerator = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedSection, setSelectedSection] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState(null);

  const { data: sections = [], isLoading: secLoading } = useQuery({
    queryKey: ['my-sections', user?.lecturer?.id],
    queryFn: () => getSectionsByLecturer(user?.lecturer?.id),
    enabled: !!user?.lecturer?.id,
  });

  const generateMutation = useMutation({
    mutationFn: (courseSectionId) => generateQRToken({ courseSectionId }),
    onSuccess: (data) => {
      setQrData(data);
      setShowQR(true);
      toast.success('QR kodu oluşturuldu');
      qc.invalidateQueries({ queryKey: ['recent-qr-scans', selectedSection] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'QR oluşturulamadı'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (tokenId) => deactivateQRToken(tokenId),
    onSuccess: () => {
      setShowQR(false);
      setQrData(null);
      toast.success('QR kodu devre dışı bırakıldı');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Kapatılamadı'),
  });

  const { data: recentScans = [] } = useQuery({
    queryKey: ['recent-qr-scans', selectedSection],
    queryFn: () => getRecentQRScans(selectedSection),
    enabled: !!selectedSection,
    refetchInterval: 3000,
  });

  const handleGenerate = () => {
    if (!selectedSection) return;
    generateMutation.mutate(selectedSection);
  };

  if (secLoading) return <CardSkeleton count={2} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title="QR Kod Oluşturucu" subtitle="Dersleriniz için QR kodu oluşturarak yoklama alın" />

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15 }}>Ders Şubesi Seçin</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setShowQR(false);
              setQrData(null);
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 10,
              border: '2px solid var(--color-border)',
              fontSize: 14,
            }}
          >
            <option value="">-- Ders Şubesi Seçin --</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.course?.name} - {s.sectionCode || 'Şube'}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!selectedSection || generateMutation.isPending}
          >
            <QrCode size={16} /> {generateMutation.isPending ? 'Oluşturuluyor...' : 'QR Oluştur'}
          </button>
        </div>
      </div>

      {showQR && qrData && (
        <div className="card" style={{ padding: 40, textAlign: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 18, color: '#2563eb' }}>Aktif QR Kodu</h3>
          <div
            style={{
              background: 'white',
              padding: 24,
              borderRadius: 16,
              display: 'inline-block',
              border: '2px solid var(--color-border)',
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData.token)}`}
              alt="QR Kod"
              style={{ width: 250, height: 250 }}
            />
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
            <Clock size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
            Süre: {qrData.expiresAt ? new Date(qrData.expiresAt).toLocaleTimeString('tr-TR') : 'Bilinmiyor'}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              fontFamily: 'monospace',
              background: 'var(--color-bg-secondary)',
              padding: '8px 16px',
              borderRadius: 8,
              display: 'inline-block',
            }}
          >
            {qrData.token}
          </div>
          <div style={{ marginTop: 16 }}>
            <button
              className="btn btn-danger"
              onClick={() => deactivateMutation.mutate(qrData.id)}
              disabled={deactivateMutation.isPending}
            >
              <XCircle size={14} /> QR'ı Kapat
            </button>
          </div>
        </div>
      )}

      {selectedSection && (
        <div className="card" style={{ padding: 20 }}>
          <h3
            style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Users size={18} /> Son Taramalar
          </h3>
          {recentScans.length > 0 ? (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Öğrenci</th>
                    <th>Numara</th>
                    <th>Saat</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScans.map((scan, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>
                        {scan.student?.firstName} {scan.student?.lastName}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {scan.student?.studentNumber}
                      </td>
                      <td style={{ fontSize: 13 }}>{new Date(scan.scannedAt).toLocaleTimeString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="Henüz tarama yok"
              description="Öğrenciler QR kodu tarattıkça burada görünecek"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default QRGenerator;
