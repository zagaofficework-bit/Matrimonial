import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, isStaff } from '../../context/AuthContext';
import { useMyProfileStatus } from '../../hooks/useMyProfileStatus';
import NotificationBell from '../NotificationBell/NotificationBell';
import { useHasMatch } from '../../hooks/useHasMatch';
import { useMyStoryStatus } from '../../hooks/useMyStoryStatus';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { hasProfile } = useMyProfileStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const { hasMatch } = useHasMatch();
  const { hasStory } = useMyStoryStatus();

  // Bahar click karne pe dropdown band ho jaye
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Vivah<span>Setu</span>
        </Link>

        {isAuthenticated && (
          <nav className="navbar-links navbar-desktop-only">
            <Link to="/">Home</Link>
           
            <Link to="/search">Search</Link>
            <Link to="/success-stories">Success Stories</Link>
          </nav>
        )}

        <nav className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to="/chat" className="navbar-chat-btn navbar-desktop-only" aria-label="Messages">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </Link>
              <NotificationBell />
              <div className="navbar-profile navbar-desktop-only" ref={menuRef}>
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
                        <Link to="/preferences" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                          Partner Preferences
                        </Link>
                        <Link to="/interests" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                          Interests
                        </Link>
                        <Link to="/matches" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                          Matches
                        </Link>
                        <Link to="/saved-profiles" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                          Saved Profiles
                        </Link>
                        <Link
                          to="/membership"
                          className="navbar-dropdown-item navbar-dropdown-highlight"
                          onClick={() => setMenuOpen(false)}
                        >
                          Upgrade Membership
                        </Link>
                        {hasMatch && (
                          <Link to="/success-stories/new" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                            {hasStory ? 'My Success Story' : 'Share Your Story'}
                          </Link>
                        )}
                      </>
                    )}

                    {isStaff(user) && (
                      <Link to="/admin" className="navbar-dropdown-item navbar-dropdown-admin" onClick={() => setMenuOpen(false)}>
                        🛡️ Admin Panel
                      </Link>
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
            <div className="navbar-guest-actions navbar-desktop-only">
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}

          {/* Sirf mobile screen pe dikhta hai: brand, notification bell (upar) aur ye hamburger */}
          <button
            type="button"
            className="navbar-hamburger-btn"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`navbar-hamburger-icon ${mobileMenuOpen ? 'is-open' : ''}`}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="navbar-mobile-menu" ref={mobileMenuRef}>
          {isAuthenticated ? (
            <>
              <Link to="/" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                Home
              </Link>
              <a href="/#browse-profiles" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                Browse
              </a>
              <Link to="/search" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                Search
              </Link>
              <Link to="/success-stories" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                Success Stories
              </Link>
              <Link to="/chat" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                Messages
              </Link>

              <div className="navbar-mobile-divider" />

              {hasProfile === false ? (
                <Link
                  to="/profile/create"
                  className="navbar-dropdown-item navbar-dropdown-highlight"
                  onClick={closeMobileMenu}
                >
                  + Create Your Profile
                </Link>
              ) : (
                <>
                  <Link to="/profile/me" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                    My Profile
                  </Link>
                  <Link to="/profile/create" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                    Edit Profile
                  </Link>
                  <Link to="/preferences" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                    Partner Preferences
                  </Link>
                  <Link to="/interests" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                    Interests
                  </Link>
                  <Link to="/matches" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                    Matches
                  </Link>
                  <Link to="/saved-profiles" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                    Saved Profiles
                  </Link>
                  <Link
                    to="/membership"
                    className="navbar-dropdown-item navbar-dropdown-highlight"
                    onClick={closeMobileMenu}
                  >
                    Upgrade Membership
                  </Link>
                  {hasMatch && (
                    <Link to="/success-stories/new" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                      {hasStory ? 'My Success Story' : 'Share Your Story'}
                    </Link>
                  )}
                </>
              )}

              {isStaff(user) && (
                <Link to="/admin" className="navbar-dropdown-item navbar-dropdown-admin" onClick={closeMobileMenu}>
                  🛡️ Admin Panel
                </Link>
              )}

              <button type="button" className="navbar-dropdown-item navbar-dropdown-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-dropdown-item" onClick={closeMobileMenu}>
                Login
              </Link>
              <Link to="/register" className="navbar-dropdown-item navbar-dropdown-highlight" onClick={closeMobileMenu}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}