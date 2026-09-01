import { useEffect, useState, useCallback } from 'react';
import {
  listUsers,
  suspendUser,
  activateUser,
  blockUser,
  unblockUser,
  deleteUser
} from '../../../api/admin/users.api';
import DataTable from '../../../components/admin/DataTable/DataTable';
import Pagination from '../../../components/admin/Pagination/Pagination';
import Badge from '../../../components/admin/Badge/Badge';
import ConfirmDialog from '../../../components/admin/ConfirmDialog/ConfirmDialog';
import { useAuth, isSuperAdmin } from '../../../context/AuthContext';
import UserDetailModal from './UserDetailModal';
import './Users.css';

const STATUS_OPTIONS = ['active', 'incomplete', 'pending_approval', 'deactivated', 'matrimony_closed', 'suspended', 'deleted'];

export default function UserDirectory() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { type, user }
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchUsers = useCallback((page = 1) => {
    setLoading(true);
    setError('');
    listUsers({ search: search || undefined, status: status || undefined, page, limit: 15 })
      .then((result) => {
        setUsers(result.users);
        setPagination(result.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Users load nahi ho paye.'))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchUsers(1);
  }

  async function runAction() {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const { type, user } = confirmAction;
      if (type === 'suspend') await suspendUser(user._id);
      if (type === 'activate') await activateUser(user._id);
      if (type === 'block') await blockUser(user._id);
      if (type === 'unblock') await unblockUser(user._id);
      if (type === 'delete') await deleteUser(user._id);
      setConfirmAction(null);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Action fail ho gaya.');
      setConfirmAction(null);
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact', render: (u) => (
      <div>
        <div>{u.email || '—'}</div>
        <div style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>{u.phone}</div>
      </div>
    ) },
    { key: 'role', label: 'Role', render: (u) => <Badge value={u.role} tone={u.role === 'super_admin' ? 'default' : undefined} /> },
    { key: 'status', label: 'Status', render: (u) => <Badge value={u.status} /> },
    { key: 'blocked', label: 'Blocked', render: (u) => (u.isBlocked ? <Badge value="blocked" /> : '—') },
    { key: 'actions', label: 'Actions', render: (u) => (
      <div className="data-table-actions">
        <button type="button" className="admin-btn btn-ghost btn-sm" onClick={() => setSelectedUserId(u._id)}>View</button>
        {u.status === 'suspended' ? (
          <button type="button" className="admin-btn btn-success btn-sm" onClick={() => setConfirmAction({ type: 'activate', user: u })}>Activate</button>
        ) : (
          <button type="button" className="admin-btn btn-secondary btn-sm" onClick={() => setConfirmAction({ type: 'suspend', user: u })}>Suspend</button>
        )}
        {u.isBlocked ? (
          <button type="button" className="admin-btn btn-success btn-sm" onClick={() => setConfirmAction({ type: 'unblock', user: u })}>Unblock</button>
        ) : (
          <button type="button" className="admin-btn btn-secondary btn-sm" onClick={() => setConfirmAction({ type: 'block', user: u })}>Block</button>
        )}
        {isSuperAdmin(currentUser) && (
          <button type="button" className="admin-btn btn-danger btn-sm" onClick={() => setConfirmAction({ type: 'delete', user: u })}>Delete</button>
        )}
      </div>
    ) }
  ];

  const CONFIRM_COPY = {
    suspend: { title: 'Suspend User', message: 'Ye user ka account suspend karna hai?', confirmLabel: 'Suspend', tone: 'secondary' },
    activate: { title: 'Activate User', message: 'Ye user ka account wapas active karna hai?', confirmLabel: 'Activate', tone: 'success' },
    block: { title: 'Block User', message: 'Ye user ko block karna hai?', confirmLabel: 'Block', tone: 'secondary' },
    unblock: { title: 'Unblock User', message: 'Ye user ko unblock karna hai?', confirmLabel: 'Unblock', tone: 'success' },
    delete: { title: 'Delete User', message: 'Ye action permanent hai (soft-delete). Pakka delete karna hai?', confirmLabel: 'Delete', tone: 'danger' }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div>
          <h1>User Directory</h1>
          <p className="page-subtitle">Saare members, unka status aur profile management.</p>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <form className="filters-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Naam, email ya phone se search karo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 240 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button type="submit" className="admin-btn admin-btn-primary btn-sm">Search</button>
      </form>

      {loading ? (
        <p className="admin-state-message">Loading users…</p>
      ) : (
        <>
          <DataTable columns={columns} rows={users} emptyMessage="Koi user nahi mila." />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={fetchUsers} />
        </>
      )}

      {confirmAction && (
        <ConfirmDialog
          title={CONFIRM_COPY[confirmAction.type].title}
          message={CONFIRM_COPY[confirmAction.type].message}
          confirmLabel={CONFIRM_COPY[confirmAction.type].confirmLabel}
          tone={CONFIRM_COPY[confirmAction.type].tone}
          loading={actionLoading}
          onConfirm={runAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onRoleChanged={() => fetchUsers(pagination.page)}
        />
      )}
    </div>
  );
}
