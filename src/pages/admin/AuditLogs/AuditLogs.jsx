import { useEffect, useState, useCallback } from 'react';
import { listAuditLogs } from '../../../api/admin/auditLogs.api';
import DataTable from '../../../components/admin/DataTable/DataTable';
import Pagination from '../../../components/admin/Pagination/Pagination';
import Badge from '../../../components/admin/Badge/Badge';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = useCallback((page = 1) => {
    setLoading(true);
    listAuditLogs({ action: actionFilter || undefined, page, limit: 25 })
      .then((result) => {
        setLogs(result.logs);
        setPagination(result.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Audit logs load nahi hue.'))
      .finally(() => setLoading(false));
  }, [actionFilter]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const columns = [
    { key: 'admin', label: 'Staff Member', render: (l) => (
      <div>
        <div>{l.admin?.name || '—'}</div>
        <div style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>{l.admin?.role}</div>
      </div>
    ) },
    { key: 'action', label: 'Action', render: (l) => <Badge value={l.action} tone="default" /> },
    { key: 'targetType', label: 'Target', render: (l) => l.targetType ? `${l.targetType} · ${String(l.targetId || '').slice(-6)}` : '—' },
    { key: 'metadata', label: 'Details', render: (l) => (
      l.metadata && Object.keys(l.metadata).length > 0
        ? <code style={{ fontSize: '0.72rem' }}>{JSON.stringify(l.metadata)}</code>
        : '—'
    ) },
    { key: 'createdAt', label: 'When', render: (l) => new Date(l.createdAt).toLocaleString('en-IN') }
  ];

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div>
          <h1>Audit Logs</h1>
          <p className="page-subtitle">Har staff action ka record — kisne, kya, kab kiya.</p>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Filter by action (e.g. suspend_user)…"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{ minWidth: 240 }}
        />
      </div>

      {loading ? (
        <p className="admin-state-message">Loading…</p>
      ) : (
        <>
          <DataTable columns={columns} rows={logs} rowKey="_id" emptyMessage="Koi audit log nahi mila." />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={fetchLogs} />
        </>
      )}
    </div>
  );
}
