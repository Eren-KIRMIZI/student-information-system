import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../../api/system.api';
import { PageHeader, FilterBar, TableSkeleton, ErrorState, EmptyState } from '../../components/ui/index';
import { Shield, Search, ArrowRight, Clock, Activity, Monitor } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

const methodColors = {
  GET: 'var(--color-info)',
  POST: 'var(--color-success)',
  PUT: 'var(--color-warning)',
  DELETE: 'var(--color-danger)',
  PATCH: 'var(--color-warning)',
};

const AuditViewer = () => {
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-logs', page, entity, action],
    queryFn: () => getAuditLogs({ page, limit: 20, entity, action }),
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* Main List */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <PageHeader
          title="Denetim İzi (Audit Log)"
          subtitle="Sistemdeki tüm API isteklerinin detaylı iz kaydı (Trace Correlation, Before/After data)"
        />

        <FilterBar>
          <div style={{ position: 'relative', flex: 1, maxWidth: 250 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Entity (Örn: User, Grade)..."
              style={{ paddingLeft: 36 }}
              value={entity}
              onChange={(e) => {
                setEntity(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div style={{ position: 'relative', flex: 1, maxWidth: 250 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Action (Örn: CREATE, UPDATE)..."
              style={{ paddingLeft: 36 }}
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </FilterBar>

        <div className="card" style={{ padding: 0 }}>
          {isLoading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : !data?.data?.length ? (
            <EmptyState
              icon={Shield}
              title="Kayıt bulunamadı"
              description="Belirtilen kriterlere uygun audit log yok."
            />
          ) : (
            <>
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Zaman & Trace ID</th>
                      <th>Method & Path</th>
                      <th>Entity & Action</th>
                      <th>Status & Süre</th>
                      <th>Detay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        style={{
                          cursor: 'pointer',
                          background: selectedLog?.id === log.id ? 'var(--color-surface-2)' : 'transparent',
                        }}
                      >
                        <td style={{ fontSize: 13 }}>
                          <div style={{ fontWeight: 500 }}>{dayjs(log.createdAt).format('DD MMM, HH:mm:ss')}</div>
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--color-text-muted)',
                              fontFamily: 'monospace',
                              marginTop: 4,
                            }}
                          >
                            {log.correlationId ? log.correlationId.substring(0, 8) + '...' : '-'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 4,
                                color: methodColors[log.method] || 'var(--color-text-secondary)',
                                background: (methodColors[log.method] || 'var(--color-text-secondary)') + '20',
                              }}
                            >
                              {log.method}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{log.path}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{log.entity}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{log.action}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                display: 'inline-block',
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: log.statusCode < 400 ? 'var(--color-success)' : 'var(--color-danger)',
                              }}
                            />
                            <span style={{ fontWeight: 500, fontSize: 13 }}>{log.statusCode}</span>
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: 'var(--color-text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              marginTop: 4,
                            }}
                          >
                            <Clock size={12} /> {log.durationMs}ms
                          </div>
                        </td>
                        <td>
                          <ArrowRight size={16} color="var(--color-text-muted)" />
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

      {/* Detail Sidebar */}
      {selectedLog && (
        <div className="card animate-fade-in" style={{ width: 380, position: 'sticky', top: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Detay Görüntüleyici</h3>
            <button
              onClick={() => setSelectedLog(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              Kapat
            </button>
          </div>

          <div style={{ marginBottom: 16, padding: 12, background: 'var(--color-surface-2)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Activity size={16} color="var(--color-primary)" />
              <strong style={{ fontSize: 13 }}>Trace & Network</strong>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'grid', gap: 4 }}>
              <div>
                <strong>Trace ID:</strong>{' '}
                <span style={{ fontFamily: 'monospace' }}>{selectedLog.correlationId || '-'}</span>
              </div>
              <div>
                <strong>IP Address:</strong> {selectedLog.ipAddress || '-'}
              </div>
              <div title={selectedLog.userAgent}>
                <strong>User Agent:</strong>{' '}
                {selectedLog.userAgent ? selectedLog.userAgent.substring(0, 30) + '...' : '-'}
              </div>
              <div>
                <strong>User ID:</strong>{' '}
                <span style={{ fontFamily: 'monospace' }}>{selectedLog.userId || 'Guest'}</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-danger)' }}>
              Değişiklik Öncesi (Before)
            </div>
            <pre
              style={{
                margin: 0,
                padding: 12,
                background: '#1e1e1e',
                color: '#d4d4d4',
                borderRadius: 8,
                fontSize: 11,
                overflowX: 'auto',
                maxHeight: 200,
              }}
            >
              {selectedLog.before ? JSON.stringify(selectedLog.before, null, 2) : 'Veri yok (veya gizli)'}
            </pre>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-success)' }}>
              Değişiklik Sonrası (After / Request Body)
            </div>
            <pre
              style={{
                margin: 0,
                padding: 12,
                background: '#1e1e1e',
                color: '#d4d4d4',
                borderRadius: 8,
                fontSize: 11,
                overflowX: 'auto',
                maxHeight: 200,
              }}
            >
              {selectedLog.after ? JSON.stringify(selectedLog.after, null, 2) : 'Veri yok (veya gizli)'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditViewer;
