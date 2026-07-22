import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { scanQRToken } from '../../api/advanced.api';
import { PageHeader } from '../../components/ui/index';
import { QrCode, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const QRScan = () => {
  const [token, setToken] = useState('');

  const mutation = useMutation({
    mutationFn: (tok) => scanQRToken({ token: tok }),
    onSuccess: () => {
      toast.success('Kayıt başarılı!');
      setToken('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'QR okutulamadı'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    mutation.mutate(token.trim());
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="QR Yoklama" subtitle="Hocanızın gösterdiği QR kodu buraya okutun" />

      <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: 40, textAlign: 'center' }}>
        <QrCode size={64} color="#2563eb" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 20 }}>QR Kodu Okutun</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 24 }}>
          Akademisyenin oluşturduğu QR kodu telefonunuzla taratın veya kodu aşağıya yapıştırın
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="QR kodunu buraya yapıştırın..."
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: 14,
              borderRadius: 10,
              border: '2px solid var(--color-border)',
              outline: 'none',
              textAlign: 'center',
              fontFamily: 'monospace',
              letterSpacing: 1,
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!token.trim() || mutation.isPending}
            style={{ padding: '12px 24px', fontSize: 15, fontWeight: 600 }}
          >
            {mutation.isPending ? 'İşleniyor...' : 'Yoklamayı Onayla'}
          </button>
        </form>
        {mutation.isSuccess && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: '#f0fdf4',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              color: '#059669',
              fontWeight: 600,
            }}
          >
            <CheckCircle size={18} /> Yoklama başarıyla alındı!
          </div>
        )}
        {mutation.isError && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: '#fef2f2',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              color: '#dc2626',
              fontWeight: 600,
            }}
          >
            <XCircle size={18} /> {mutation.error?.response?.data?.message || 'Hata'}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScan;
