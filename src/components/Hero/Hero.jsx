import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="hero-eyebrow">Premium Matchmaking</span>
          <h1 className="hero-title">
            Where Two Hearts Begin a <span>Lifelong Journey</span>
          </h1>
          <p className="hero-subtitle">
            Trusted by families everywhere. Find someone who truly fits your life, values, and
            aspirations through our curated and verified community.
          </p>

          <div className="hero-actions">
            <Link to="/profile/create" className="btn btn-primary">
              Create Your Profile
            </Link>
            <a href="#browse-profiles" className="btn btn-outline">
              Browse Profiles
            </a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat-avatars">
              <span className="hero-stat-avatar">P</span>
              <span className="hero-stat-avatar">R</span>
              <span className="hero-stat-avatar">A</span>
            </div>
            <span className="hero-stat-text">
              <strong>5M+</strong> Success Stories
            </span>
          </div>
        </div>

        <div className="hero-media">
          <div className="hero-photo">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=700&q=80"
              alt="A couple celebrating their wedding"
            />
          </div>
          <div className="hero-quote-card">
            <p>&ldquo;We found our perfect match.&rdquo;</p>
            <span>Priya &amp; Rahul — Married Dec 2023</span>
          </div>
        </div>
      </div>
    </section>
  );
}
