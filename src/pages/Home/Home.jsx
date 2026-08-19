import { useEffect, useState } from 'react';
import Hero from '../../components/Hero/Hero';
import TrustBadges from '../../components/TrustBadges/TrustBadges';
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import { browseProfiles } from '../../api/profile.api';
import './Home.css';

export default function Home() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProfiles() {
      try {
        const data = await browseProfiles();
        if (isMounted) setProfiles(data);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Profiles load nahi ho payi.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfiles();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Hero />
      <TrustBadges />

      <div className="page-container" id="browse-profiles">
        <div className="home-header">
          <h2>Browse Profiles</h2>
          <p className="home-subtitle">Explore members and find your match</p>
        </div>

        {loading && <p className="state-message">Loading profiles...</p>}
        {!loading && error && <p className="state-message">{error}</p>}
        {!loading && !error && profiles.length === 0 && (
          <p className="state-message">No profiles to show yet. Check back soon!</p>
        )}

        {!loading && !error && profiles.length > 0 && (
          <div className="profile-grid">
            {profiles.map((profile) => (
              <ProfileCard key={profile._id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
