import './AuthSidePanel.css';

export default function AuthSidePanel({ eyebrow, title, subtitle }) {
  return (
    <div className="auth-side-panel">
      <img
        className="auth-side-photo"
        src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=80"
        alt=""
        aria-hidden="true"
      />
      <div className="auth-side-scrim" aria-hidden="true" />

      <svg
        className="auth-side-motif"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="100" cy="80" r="34" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="100" cy="80" r="34" stroke="currentColor" strokeWidth="1.5" transform="translate(18,10)" opacity="0.55" />
        <path
          d="M40 150 C 70 130, 130 130, 160 150"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <path d="M20 40 Q30 20 50 24" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M180 40 Q170 20 150 24" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      </svg>

      <div className="auth-side-content">
        <span className="auth-side-logo">
          Soul<span>Tie</span>
        </span>

        {eyebrow && <span className="auth-side-eyebrow">{eyebrow}</span>}
        <h2 className="auth-side-title">{title}</h2>
        {subtitle && <p className="auth-side-subtitle">{subtitle}</p>}

        <div className="auth-side-quote">
          <p>&ldquo;We found our perfect match.&rdquo;</p>
          <span>Priya &amp; Rahul — Married Dec 2023</span>
        </div>
      </div>
    </div>
  );
}
