import { useEffect, useState, useCallback } from 'react';
import { listReports, updateReportStatus } from '../../../api/admin/reports.api';
import DataTable from '../../../components/admin/DataTable/DataTable';
import Pagination from '../../../components/admin/Pagination/Pagination';
import Badge from '../../../components/admin/Badge/Badge';
import Modal from '../../../components/admin/Modal/Modal';

const STATUS_OPTIONS = ['pending', 'reviewed', 'action_taken', 'dismissed'];

export default function ReportsHub() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionTarget, setActionTarget] = useState(null); // report object
  const [newStatus, setNewStatus] = useState('reviewed');
  const [blockUser, setBlockUser] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback((page = 1) => {
    setLoading(true);
    listReports({ status: status || undefined, page, limit: 15 })
      .then((result) => {
        setReports(result.reports);
        setPagination(result.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Reports load nahi hui.'))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  function openActionModal(report) {
    setActionTarget(report);
    setNewStatus(report.status === 'pending' ? 'reviewed' : report.status);
    setBlockUser(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      await updateReportStatus(actionTarget._id, newStatus, blockUser);
      setActionTarget(null);
      fetchData(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Update fail hua.');
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    { key: 'reportedUser', label: 'Reported User', render: (r) => r.reportedUser?.name || '—' },
    { key: 'reportedBy', label: 'Reported By', render: (r) => r.reportedBy?.name || '—' },
    { key: 'reason', label: 'Reason', render: (r) => <span title={r.description}>{r.reason}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    { key: 'createdAt', label: 'Filed', render: (r) => new Date(r.createdAt).toLocaleDateString('en-IN') },
    { key: 'actions', label: 'Actions', render: (r) => (
      <button type="button" className="admin-btn admin-btn-primary btn-sm" onClick={() => openActionModal(r)}>Review</button>
    ) }
  ];

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div>
          <h1>Abuse Reports Hub</h1>
          <p className="page-subtitle">Report queue review karo aur zaroorat pade to user ban karo.</p>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="filters-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="admin-state-message">Loading…</p>
      ) : (
        <>
          <DataTable columns={columns} rows={reports} emptyMessage="Koi report nahi mili." />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={fetchData} />
        </>
      )}

      {actionTarget && (
        <Modal
          title="Update Report"
          onClose={() => setActionTarget(null)}
          footer={
            <>
              <button type="button" className="admin-btn btn-secondary" onClick={() => setActionTarget(null)}>Cancel</button>
              <button type="submit" form="report-status-form" className="admin-btn admin-btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          <form id="report-status-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--color-muted)' }}>Reason given</p>
              <p style={{ margin: 0 }}>{actionTarget.description || actionTarget.reason}</p>
            </div>

            <div className="form-group">
              <label htmlFor="report-status">Status</label>
              <select id="report-status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="checkbox-row">
              <input
                id="block-user"
                type="checkbox"
                checked={blockUser}
                onChange={(e) => setBlockUser(e.target.checked)}
              />
              <label htmlFor="block-user" style={{ margin: 0 }}>Also block the reported user</label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
