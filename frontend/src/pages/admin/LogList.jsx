import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLogs } from '../../api/system.api';
import { PageHeader, FilterBar, TableSkeleton, ErrorState, EmptyState } from '../../components/ui/index';
import { FileText, Search, ShieldAlert, CheckCircle, Info, XCircle } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

const LogList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['logs', page, search, level],
    queryFn: () => getLogs({ page, limit: 20, search, level }),
  });

  const levelIcon = {
    INFO: <Info size={16} color="var(--color-info)" />,
    WARN: <ShieldAlert size={16} color="var(--color-warning)" />,
    ERROR: <XCircle size={16} color="var(--color-danger)" />,
    SUCCESS: <CheckCircle size={16} color="var(--color-success)" />,
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Sistem Logları" subtitle="Uygulama üzerindeki işlem hareketleri ve hatalar" />

      <FilterBar>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Log mesajı ara..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="input"
          style={{ width: 140 }}
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tüm Seviyeler</option>
          <option value="INFO">Bilgi (Info)</option>
          <option value="SUCCESS">Başarılı</option>
          <option value="WARN">Uyarı</option>
          <option value="ERROR">Hata</option>
        </select>
      </FilterBar>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <TableSkeleton rows={8} cols={4} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.data?.length ? (
          <EmptyState icon={FileText} title="Log bulunamadı" description="Kriterlere uygun kayıt yok." />
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Seviye</th>
                    <th>İşlem (Mesaj)</th>
                    <th>Kullanıcı (IP)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((log) => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                        {dayjs(log.createdAt).format('DD MMM YYYY, HH:mm:ss')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          {levelIcon[log.level] || <Info size={16} />}
                          {log.level}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{log.action || log.message}</div>
                        {log.action && (
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {log.message}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {log.user ? log.user.email : 'Sistem'}
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{log.ipAddress || ''}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.pagination && data.pagination.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: 16,
                  borderTop: '1px solid var(--color-border)',
                  justifyContent: 'center',
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Önceki
                </button>
                <div style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>
                  {page} / {data.pagination.totalPages}
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LogList;
