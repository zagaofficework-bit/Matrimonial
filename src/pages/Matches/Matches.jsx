import { useEffect, useState } from 'react';
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import { getMatches } from '../../api/interest.api';
import './Matches.css';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadMatches() {
      try {
        const data = await getMatches();
        if (isMounted) setMatches(data);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Matches load nahi ho paye.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMatches();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-container">
      <div className="matches-header">
        <h2>Your Matches</h2>
        <p className="matches-subtitle">Profiles where interest has been accepted on both sides</p>
      </div>

      {loading && <p className="state-message">Loading matches...</p>}
      {!loading && error && <p className="state-message">{error}</p>}
      {!loading && !error && matches.length === 0 && (
        <p className="state-message">No matches yet. Connect with profiles to get started!</p>
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="profile-grid">
          {matches.map((match) =>
            match.profile ? (
              <ProfileCard
                key={match._id}
                profile={{ ...match.profile, user: match.user }}
                variant="matched"
              />
            ) : (
              <div className="matches-no-profile-card" key={match._id}>
                <div className="matches-no-profile-avatar">
                  {(match.user?.name || '?').charAt(0).toUpperCase()}
                </div>
                <p className="matches-no-profile-name">{match.user?.name || 'Member'}</p>
                <p className="matches-no-profile-note">Profile not created yet</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
