import { useEffect, useState } from 'react';
import Modal from '../../../components/admin/Modal/Modal';
import Badge from '../../../components/admin/Badge/Badge';
import { getUserDetail, changeUserRole } from '../../../api/admin/users.api';
import { useAuth, isSuperAdmin } from '../../../context/AuthContext';

const ROLE_OPTIONS = ['member', 'moderator', 'admin', 'super_admin'];

export default function UserDetailModal({ userId, onClose, onRoleChanged }) {
  const { user: currentUser } = useAuth();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [roleSaving, setRoleSaving] = useState(false);

  useEffect(() => {
    getUserDetail(userId)
      .then(setDetail)
      .catch((err) => setError(err.response?.data?.message || 'Detail load nahi hua.'))
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleRoleChange(e) {
    const newRole = e.target.value;
    setRoleSaving(true);
    try {
      const updatedUser = await changeUserRole(userId, newRole);
      setDetail((prev) => ({ ...prev, user: updatedUser }));
      onRoleChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Role change fail hua.');
    } finally {
      setRoleSaving(false);
    }
  }

  return (
    <Modal title="User Detail" onClose={onClose}>
      {loading && <p className="admin-state-message">Loading…</p>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {detail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <strong>{detail.user.name}</strong>
            <div style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              {detail.user.email || '—'} · {detail.user.phone}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge value={detail.user.status} />
            {detail.user.isBlocked && <Badge value="blocked" />}
            <Badge value={detail.user.role} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Role</label>
            <select value={detail.user.role} onChange={handleRoleChange} disabled={!isSuperAdmin(currentUser) || roleSaving}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r.replace('_', ' ')}</option>
              ))}
            </select>
            {!isSuperAdmin(currentUser) && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 4 }}>
                Sirf super_admin role change kar sakta hai.
              </p>
            )}
          </div>

          <div className="admin-form-row">
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)' }}>Membership</p>
              <p style={{ margin: '2px 0 0', fontWeight: 600 }}>
                {detail.membership?.isActive ? detail.membership.plan?.name : 'None'}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)' }}>Reports against user</p>
              <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{detail.reportsAgainstCount}</p>
            </div>
          </div>

          {detail.profile && (
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: 'var(--color-muted)' }}>KYC status</p>
              <Badge value={detail.profile.verification?.status || 'not_submitted'} />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
