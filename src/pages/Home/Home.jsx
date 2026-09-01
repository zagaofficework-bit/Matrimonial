import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../../components/Hero/Hero';
import TrustBadges from '../../components/TrustBadges/TrustBadges';
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import SuccessStoriesSection from '../../components/SuccessStories/SuccessStoriesSection';
import { browseProfiles } from '../../api/profile.api';
import { getSavedProfileIds } from '../../api/savedProfile.api';
import { getMyPreferences } from '../../api/preference.api';
import { computeMatchScore, meetsPreference } from '../../utils/Matchscore';
import './Home.css';

const MATCH_THRESHOLD = 60;

export default function Home() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState([]);
  const [preference, setPreference] = useState(null);
  const [hasPreference, setHasPreference] = useState(false);

  useEffect(() => {
    getSavedProfileIds()
      .then(setSavedIds)
      .catch(() => {}); // Silent fail - bookmark state sirf cosmetic hai
  }, []);

  useEffect(() => {
    let isMounted = true;

    getMyPreferences()
      .then((pref) => {
        if (isMounted) {
          setPreference(pref);
          setHasPreference(true);
        }
      })
      .catch(() => {
        // 404 - preferences abhi set nahi ki hain. Home un-filtered rehta hai.
        if (isMounted) setHasPreference(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  // Preference set hai to sirf >= 60% (ya strictFilter ON hone par 100%)
  // match wali profiles dikhao, best match sabse upar. Preference abhi tak
  // set nahi hai to purana behaviour (sab profiles, jaisi order backend se
  // aayi) waisa hi rehta hai.
  const visibleProfiles = preference
    ? profiles
        .filter((profile) => meetsPreference(profile, preference, MATCH_THRESHOLD))
        .sort((a, b) => (computeMatchScore(b, preference) || 0) - (computeMatchScore(a, preference) || 0))
    : profiles;

  return (
    <>
      <Hero />
      <TrustBadges />
      <SuccessStoriesSection />

      <div className="page-container" id="browse-profiles">
        <div className="home-header">
          <div>
            <h2>Browse Profiles</h2>
            <p className="home-subtitle">
              {preference
                ? `Showing profiles matching ${MATCH_THRESHOLD}% or more of your preferences`
                : 'Explore members and find your match'}
            </p>
          </div>
          <button type="button" className="btn btn-outline home-view-more-btn" onClick={() => navigate('/search')}>
            View More
          </button>
        </div>

        {!loading && hasPreference === false && (
          <div className="home-pref-banner">
            <span>Set your partner preferences to see a match % on every profile.</span>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/preferences')}>
              Set Preferences
            </button>
          </div>
        )}

        {loading && <p className="state-message">Loading profiles...</p>}
        {!loading && error && <p className="state-message">{error}</p>}
        {!loading && !error && visibleProfiles.length === 0 && (
          <p className="state-message">
            {preference
              ? "No profiles cross your match threshold right now - try widening your preferences."
              : 'No profiles to show yet. Check back soon!'}
          </p>
        )}

        {!loading && !error && visibleProfiles.length > 0 && (
          <div className="profile-grid">
            {visibleProfiles.map((profile) => (
              <ProfileCard
                key={profile._id}
                profile={profile}
                initiallySaved={savedIds.includes(profile._id)}
                matchPercentage={preference ? computeMatchScore(profile, preference) : null}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}