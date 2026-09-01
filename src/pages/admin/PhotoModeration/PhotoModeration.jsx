import { useEffect, useState, useCallback } from 'react';
import { listPendingPhotos, approvePhoto, rejectPhoto } from '../../../api/admin/photos.api';
import Modal from '../../../components/admin/Modal/Modal';
import './PhotoModeration.css';

export default function PhotoModeration() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null); // { profileId, photoId }
  const [reason, setReason] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    listPendingPhotos()
      .then(setPhotos)
      .catch((err) => setError(err.response?.data?.message || 'Photos load nahi hui.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleApprove(profileId, photoId) {
    setActionLoading(true);
    try {
      await approvePhoto(profileId, photoId);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Approve fail hua.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectSubmit(e) {
    e.preventDefault();
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await rejectPhoto(rejectTarget.profileId, rejectTarget.photoId, reason);
      setRejectTarget(null);
      setReason('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Reject fail hua.');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div>
          <h1>Photo Moderation</h1>
          <p className="page-subtitle">Approve ya reject karo user photos jo pending hain.</p>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {loading ? (
        <p className="admin-state-message">Loading…</p>
      ) : photos.length === 0 ? (
        <p className="admin-state-message">Koi pending photo nahi hai. 🎉</p>
      ) : (
        <div className="photo-grid">
          {photos.map((p) => (
            <div className="photo-card" key={p.photoId}>
              <img src={p.url} alt={p.user?.name} className="photo-card-img" />
              <div className="photo-card-body">
                <p className="photo-card-name">{p.user?.name}</p>
                <p className="photo-card-contact">{p.user?.email || p.user?.phone}</p>
                <div className="data-table-actions">
                  <button
                    type="button"
                    className="admin-btn btn-success btn-sm"
                    disabled={actionLoading}
                    onClick={() => handleApprove(p.profileId, p.photoId)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="admin-btn btn-danger btn-sm"
                    disabled={actionLoading}
                    onClick={() => setRejectTarget({ profileId: p.profileId, photoId: p.photoId })}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectTarget && (
        <Modal
          title="Reject Photo"
          onClose={() => setRejectTarget(null)}
          footer={
            <>
              <button type="button" className="admin-btn btn-secondary" onClick={() => setRejectTarget(null)}>Cancel</button>
              <button type="submit" form="reject-photo-form" className="admin-btn btn-danger" disabled={actionLoading}>
                {actionLoading ? 'Saving…' : 'Reject Photo'}
              </button>
            </>
          }
        >
          <form id="reject-photo-form" onSubmit={handleRejectSubmit}>
            <div className="form-group">
              <label htmlFor="photo-reason">Rejection reason</label>
              <textarea
                id="photo-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Inappropriate content, low quality…"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
