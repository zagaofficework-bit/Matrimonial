import { useEffect, useState, useCallback } from 'react';
import { listStaff, assignStaffRole, revokeStaffAccess } from '../../../api/admin/staff.api';
import { listUsers } from '../../../api/admin/users.api';
import DataTable from '../../../components/admin/DataTable/DataTable';
import Badge from '../../../components/admin/Badge/Badge';
import Modal from '../../../components/admin/Modal/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog/ConfirmDialog';
import './Staff.css';

const ALL_PERMISSIONS = [
  { key: 'users:manage', label: 'Manage Users' },
  { key: 'content:moderate', label: 'Moderate Content (photos, KYC)' },
  { key: 'reports:manage', label: 'Manage Abuse Reports' },
  { key: 'finance:manage', label: 'Manage Plans & Revenue' },
  { key: 'staff:manage', label: 'Manage Staff' },
  { key: 'audit:view', label: 'View Audit Logs' }
];

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignTarget, setAssignTarget] = useState(null); // staff user or {} for new
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // "promote a member" flow needs a user search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchStaff = useCallback(() => {
    setLoading(true);
    listStaff()
      .then(setStaff)
      .catch((err) => setError(err.response?.data?.message || 'Staff list load nahi hui.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const result = await listUsers({ search: searchQuery, limit: 5 });
      setSearchResults(result.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Search fail hua.');
    }
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    setActionLoading(true);
    try {
      await revokeStaffAccess(revokeTarget._id);
      setRevokeTarget(null);
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Revoke fail hua.');
      setRevokeTarget(null);
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    { key: 'name', label: 'Name', render: (u) => (
      <div>
        <div>{u.name}</div>
        <div style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>{u.email || u.phone}</div>
      </div>
    ) },
    { key: 'role', label: 'Role', render: (u) => <Badge value={u.role} /> },
    { key: 'permissions', label: 'Permissions', render: (u) => (
      u.role === 'super_admin' || u.role === 'admin'
        ? <span style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>All (role default)</span>
        : (u.permissions?.length
          ? <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{u.permissions.map((p) => <Badge key={p} value={p} tone="default" />)}</div>
          : <span style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>None</span>)
    ) },
    { key: 'actions', label: 'Actions', render: (u) => (
      <div className="data-table-actions">
        <button type="button" className="admin-btn btn-ghost btn-sm" onClick={() => setAssignTarget(u)}>Edit Access</button>
        {u.role !== 'super_admin' && (
          <button type="button" className="admin-btn btn-danger btn-sm" onClick={() => setRevokeTarget(u)}>Revoke</button>
        )}
      </div>
    ) }
  ];

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div>
          <h1>Staff & RBAC</h1>
          <p className="page-subtitle">Kaun staff hai, kis role me, aur kya-kya kar sakte hain.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setAssignTarget({})}>+ Add Staff</button>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {loading ? (
        <p className="admin-state-message">Loading…</p>
      ) : (
        <DataTable columns={columns} rows={staff} emptyMessage="Koi staff member nahi hai." />
      )}

      {assignTarget && (
        <Modal title={assignTarget._id ? `Edit access — ${assignTarget.name}` : 'Add Staff Member'} onClose={() => setAssignTarget(null)}>
          {!assignTarget._id && (
            <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Existing member ko naam/email/phone se dhoondo…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="admin-btn btn-secondary btn-sm">Search</button>
            </form>
          )}

          {!assignTarget._id && searchResults.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {searchResults.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  className="staff-search-result"
                  onClick={() => { setAssignTarget(u); setSearchResults([]); }}
                >
                  <strong>{u.name}</strong>
                  <span>{u.email || u.phone}</span>
                </button>
              ))}
            </div>
          )}

          {assignTarget._id && (
            <AssignRoleForm
              user={assignTarget}
              onClose={() => setAssignTarget(null)}
              onSaved={fetchStaff}
            />
          )}
        </Modal>
      )}

      {revokeTarget && (
        <ConfirmDialog
          title="Revoke Staff Access"
          message={`"${revokeTarget.name}" ko wapas normal member bana dena hai? Unki saari staff permissions hat jayengi.`}
          confirmLabel="Revoke"
          tone="danger"
          loading={actionLoading}
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}
    </div>
  );
}

function AssignRoleForm({ user, onClose, onSaved }) {
  const [role, setRole] = useState(user.role === 'member' ? 'moderator' : user.role);
  const [permissions, setPermissions] = useState(user.permissions || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function togglePermission(key) {
    setPermissions((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await assignStaffRole(user._id, role, role === 'moderator' ? permissions : []);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Save fail hua.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="staff-role">Role</label>
        <select id="staff-role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="moderator">Moderator (permission-based)</option>
          <option value="admin">Admin (full access)</option>
          <option value="super_admin">Super Admin (full access + staff mgmt)</option>
        </select>
      </div>

      {role === 'moderator' && (
        <div className="form-group">
          <label>Permissions</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ALL_PERMISSIONS.map((p) => (
              <div className="checkbox-row" key={p.key}>
                <input
                  id={`perm-${p.key}`}
                  type="checkbox"
                  checked={permissions.includes(p.key)}
                  onChange={() => togglePermission(p.key)}
                />
                <label htmlFor={`perm-${p.key}`} style={{ margin: 0 }}>{p.label}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {role !== 'moderator' && (
        <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
          {role === 'admin' ? 'Admin' : 'Super Admin'} accounts automatically get full access — no need to pick individual permissions.
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
        <button type="button" className="admin-btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Access'}</button>
      </div>
    </form>
  );
}
