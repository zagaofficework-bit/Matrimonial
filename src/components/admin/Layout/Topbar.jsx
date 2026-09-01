import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Topbar.css';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="admin-topbar">
      <div />
      <div className="admin-topbar-user">
        <div className="admin-topbar-info">
          <span className="admin-topbar-name">{user?.name}</span>
          <span className={`badge role-badge role-${user?.role}`}>{user?.role?.replace('_', ' ')}</span>
        </div>
        <button type="button" className="admin-btn btn-secondary btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
