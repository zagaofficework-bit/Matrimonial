import { NavLink } from 'react-router-dom';
import { useAuth, can, isSuperAdmin } from '../../../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: '📊', permission: null },
  { to: '/admin/users', label: 'User Directory', icon: '👥', permission: 'users:manage' },
  { to: '/admin/verifications', label: 'KYC Verifications', icon: '🛂', permission: 'content:moderate' },
  { to: '/admin/photos', label: 'Photo Moderation', icon: '🖼️', permission: 'content:moderate' },
  { to: '/admin/reports', label: 'Abuse Reports', icon: '🚩', permission: 'reports:manage' },
  { to: '/admin/plans', label: 'Membership Plans', icon: '💎', permission: 'finance:manage' },
  { to: '/admin/revenue', label: 'Revenue & Transactions', icon: '💰', permission: 'finance:manage' },
  { to: '/admin/staff', label: 'Staff & RBAC', icon: '🛡️', superAdminOnly: true },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: '📜', permission: 'audit:view' }
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="admin-sidebar-logo">💍</span>
        <span>Admin Panel</span>
      </div>

      <nav className="admin-sidebar-nav">
        {NAV_ITEMS.filter((item) => {
          if (item.superAdminOnly) return isSuperAdmin(user);
          if (!item.permission) return true;
          return can(user, item.permission);
        }).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="admin-sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <NavLink to="/" className="admin-sidebar-link admin-sidebar-back">
          <span className="admin-sidebar-icon">←</span>
          Back to Main Site
        </NavLink>
      </nav>
    </aside>
  );
}
