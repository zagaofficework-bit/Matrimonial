import { Navigate } from 'react-router-dom';
import { useAuth, can, isSuperAdmin, isStaff } from '../../../context/AuthContext';

// Guards the /admin/* section. Layered on top of the normal login check:
// - not logged in -> /login
// - logged in but not staff at all -> / (regular member, no business here)
// - requirePermission -> hides a specific admin page from a moderator who
//   wasn't granted that permission (super_admin/admin always pass)
// - requireSuperAdmin -> restricts a page to super_admin only (Staff & RBAC)
export default function AdminRoute({ children, requirePermission, requireSuperAdmin }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isStaff(user)) {
    return <Navigate to="/" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin(user)) {
    return <Navigate to="/admin" replace />;
  }

  if (requirePermission && !can(user, requirePermission)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
