import './TrustBadges.css';

const badges = [
  {
    label: '100% Verified',
    text: 'Government ID verification for all profiles.',
    bg: 'strong',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    )
  },
  {
    label: 'Privacy First',
    text: 'Control who sees your photos and details.',
    bg: 'soft',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    )
  },
  {
    label: 'Family Friendly',
    text: 'Involve your family in the search process.',
    bg: 'mint',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="8" cy="9" r="3" />
        <circle cx="16" cy="9" r="3" />
        <path d="M2 20c0-3 2.7-5 6-5s6 2 6 5" />
        <path d="M10 20c0-3 2.7-5 6-5s6 2 6 5" />
      </svg>
    )
  },
  {
    label: 'Premium Curation',
    text: 'Handpicked matches based on your preferences.',
    bg: 'blush',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
];

export default function TrustBadges() {
  return (
    <section className="trust-section">
      <div className="page-container">
        <h2 className="trust-heading">Trusted by 5M+ Families Worldwide</h2>

        <div className="trust-grid">
          {badges.map((badge) => (
            <div className="trust-card" key={badge.label}>
              <span className={`trust-icon trust-icon-${badge.bg}`}>{badge.icon}</span>
              <h3 className="trust-title">{badge.label}</h3>
              <p className="trust-text">{badge.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
