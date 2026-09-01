import { useEffect, useState } from 'react';
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import { getSavedProfiles } from '../../api/savedProfile.api';
import './SavedProfiles.css';

export default function SavedProfiles() {
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadSavedProfiles() {
      try {
        const data = await getSavedProfiles();
        if (isMounted) setSavedProfiles(data);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Saved profiles load nahi ho payi.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSavedProfiles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Card se "unsave" hone pe list se turant hata do - refetch ki zaroorat nahi
  function handleUnsave(profileId) {
    setSavedProfiles((prev) => prev.filter((entry) => entry.profile._id !== profileId));
  }

  return (
    <div className="page-container">
      <div className="saved-profiles-header">
        <h2>Saved Profiles</h2>
        <p className="saved-profiles-subtitle">Profiles jo tumne baad me dekhne ke liye save ki hain</p>
      </div>

      {loading && <p className="state-message">Loading saved profiles...</p>}
      {!loading && error && <p className="state-message">{error}</p>}
      {!loading && !error && savedProfiles.length === 0 && (
        <p className="state-message">Abhi tak koi profile save nahi ki. Search ya Home page se bookmark icon dabao!</p>
      )}

      {!loading && !error && savedProfiles.length > 0 && (
        <div className="saved-profiles-grid">
          {savedProfiles.map((entry) => (
            <ProfileCard
              key={entry.savedId}
              profile={entry.profile}
              initiallySaved
              onUnsave={handleUnsave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
