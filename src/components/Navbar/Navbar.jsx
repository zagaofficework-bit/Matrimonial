import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMyProfileStatus } from '../../hooks/useMyProfileStatus';
import NotificationBell from '../NotificationBell/NotificationBell';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { hasProfile } = useMyProfileStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Bahar click karne pe dropdown band ho jaye
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/login');
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          matrimony
        </Link>

        {isAuthenticated && (
          <nav className="navbar-links">
            <Link to="/">Home</Link>
            <a href="/#browse-profiles">Browse</a>
            <Link to="/search">Search</Link>
          </nav>
        )}

        <nav className="navbar-actions">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="navbar-profile" ref={menuRef}>
                <button
                  type="button"
                  className="navbar-avatar-btn"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-label="Profile menu"
                >
                  <span className="navbar-avatar">{initial}</span>
                </button>

                {menuOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <span className="navbar-dropdown-name">{user?.name}</span>
                      <span className="navbar-dropdown-sub">{user?.phone}</span>
                    </div>

                    {hasProfile === false ? (
                      <Link
                        to="/profile/create"
                        className="navbar-dropdown-item navbar-dropdown-highlight"
                        onClick={() => setMenuOpen(false)}
                      >
                        + Create Your Profile
                      </Link>
                    ) : (
                      <>
                        <Link to="/profile/me" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                          My Profile
                        </Link>
                        <Link
                          to="/profile/create"
                          className="navbar-dropdown-item"
                          onClick={() => setMenuOpen(false)}
                        >
                          Edit Profile
                        </Link>
                        <Link to="/interests" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                          Interests
                        </Link>
                        <Link to="/matches" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                          Matches
                        </Link>
                      </>
                    )}

                    <button
                      type="button"
                      className="navbar-dropdown-item navbar-dropdown-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-guest-actions">
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
