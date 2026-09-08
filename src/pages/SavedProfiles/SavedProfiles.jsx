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

        if (isMounted) {
          setSavedProfiles(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              'Unable to load saved profiles.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSavedProfiles();

    return () => {
      isMounted = false;
    };
  }, []);

  // Remove the profile from the list immediately when it is unsaved.
  // No refetch is required.
  function handleUnsave(profileId) {
    setSavedProfiles((prev) =>
      prev.filter((entry) => entry.profile._id !== profileId)
    );
  }

  return (
    <div className="page-container">
      <div className="saved-profiles-header">
        <h2>Saved Profiles</h2>

        <p className="saved-profiles-subtitle">
          Profiles you saved to view later
        </p>
      </div>

      {loading && (
        <p className="state-message">
          Loading saved profiles...
        </p>
      )}

      {!loading && error && (
        <p className="state-message">
          {error}
        </p>
      )}

      {!loading && !error && savedProfiles.length === 0 && (
        <p className="state-message">
          You have not saved any profiles yet. Click the bookmark
          icon from the Search or Home page to save a profile.
        </p>
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