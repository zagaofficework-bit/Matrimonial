import { useEffect, useState, useCallback } from 'react';
import { listPendingVerifications, verifyProfile, rejectProfile } from '../../../api/admin/verifications.api';
import DataTable from '../../../components/admin/DataTable/DataTable';
import Pagination from '../../../components/admin/Pagination/Pagination';
import Modal from '../../../components/admin/Modal/Modal';

export default function Verifications() {
  const [profiles, setProfiles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback((page = 1) => {
    setLoading(true);
    listPendingVerifications({ page, limit: 15 })
      .then((result) => {
        setProfiles(result.profiles);
        setPagination(result.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'List load nahi hui.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(1); }, [fetchData]);

  async function handleVerify(profileId) {
    setActionLoading(true);
    try {
      await verifyProfile(profileId);
      fetchData(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Verify fail hua.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectSubmit(e) {
    e.preventDefault();
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await rejectProfile(rejectTarget, reason);
      setRejectTarget(null);
      setReason('');
      fetchData(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Reject fail hua.');
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    { key: 'user', label: 'User', render: (p) => (
      <div>
        <div>{p.user?.name}</div>
        <div style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>{p.user?.email || p.user?.phone}</div>
      </div>
    ) },
    { key: 'updatedAt', label: 'Submitted', render: (p) => new Date(p.updatedAt).toLocaleDateString('en-IN') },
    { key: 'actions', label: 'Actions', render: (p) => (
      <div className="data-table-actions">
        <button type="button" className="admin-btn btn-success btn-sm" disabled={actionLoading} onClick={() => handleVerify(p._id)}>Approve</button>
        <button type="button" className="admin-btn btn-danger btn-sm" disabled={actionLoading} onClick={() => setRejectTarget(p._id)}>Reject</button>
      </div>
    ) }
  ];

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div>
          <h1>KYC Verifications</h1>
          <p className="page-subtitle">Profiles jo verification ke liye wait kar rahi hain.</p>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {loading ? (
        <p className="admin-state-message">Loading…</p>
      ) : (
        <>
          <DataTable columns={columns} rows={profiles} emptyMessage="Koi pending verification nahi hai. 🎉" />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={fetchData} />
        </>
      )}

      {rejectTarget && (
        <Modal
          title="Reject Profile"
          onClose={() => setRejectTarget(null)}
          footer={
            <>
              <button type="button" className="admin-btn btn-secondary" onClick={() => setRejectTarget(null)}>Cancel</button>
              <button type="submit" form="reject-profile-form" className="admin-btn btn-danger" disabled={actionLoading}>
                {actionLoading ? 'Saving…' : 'Reject Profile'}
              </button>
            </>
          }
        >
          <form id="reject-profile-form" onSubmit={handleRejectSubmit}>
            <div className="form-group">
              <label htmlFor="reason">Rejection reason</label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Document unclear, photo mismatch…"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
