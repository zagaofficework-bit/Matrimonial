import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container footer-inner">

        <div className="footer-top">

          {/* Brand */}
          <div className="footer-brand">
            <span className="footer-logo">
              Vivah<span>Setu</span>
            </span>

            <p className="footer-tagline">
              Trusted matchmaking that brings two families together as one.
            </p>
          </div>

          {/* Explore */}
          <details className="footer-col">
            <summary>Explore</summary>

            <div className="footer-col-links">
              <Link to="/">Home</Link>

              <a href="/#browse-profiles">
                Browse Profiles
              </a>

              <Link to="/profile/create">
                Create Profile
              </Link>
            </div>
          </details>

          {/* Privacy Policy */}
          <div className="footer-col">
            <Link
              to="/privacy-policy"
              className="footer-policy-link"
            >
              privacy policy
            </Link>
          </div>

          {/* Support */}
          <details className="footer-col">
            <summary>Support</summary>

            <div className="footer-col-links">
              <a href="#">Help Center</a>
              <a href="#">Contact Us</a>
              <a href="#">Terms &amp; Conditions</a>
            </div>
          </details>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} VivahSetu. All rights reserved.
          </p>

          <div className="footer-socials">

            {/* Instagram */}
            <a href="#" aria-label="Instagram">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="4"
                />

                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>

            {/* Facebook */}
            <a href="#" aria-label="Facebook">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M15 8h-2a2 2 0 0 0-2 2v10M8 12h5" />

                <path d="M13 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-1" />
              </svg>
            </a>

            {/* Twitter */}
            <a href="#" aria-label="Twitter">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M22 5.8c-.7.3-1.5.6-2.3.7.8-.5 1.4-1.3 1.7-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.3 4.6a4.1 4.1 0 0 0 1.3 5.5c-.6 0-1.3-.2-1.8-.5v.1c0 2 1.4 3.6 3.3 4a4.2 4.2 0 0 1-1.8.1 4.1 4.1 0 0 0 3.8 2.8A8.2 8.2 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.2z" />
              </svg>
            </a>

          </div>
        </div>

      </div>
    </footer>
  );
}