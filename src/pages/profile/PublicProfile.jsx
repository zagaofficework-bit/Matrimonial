import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProfileById } from '../../api/profile.api';
import { getConnectionStatus, respondToInterest, sendInterest } from '../../api/interest.api';
import './PublicProfile.css';

// Register page pe "Profile is for" me jo options diye jaate hain, unhi
// values ko public profile pe readable label ke roop me dikhane ke liye.
const PROFILE_TYPE_LABELS = {
  self: 'Self',
  parent: 'Parent',
  sibling: 'Sibling',
  relative: 'Relative',
  friend: 'Friend'
};

// Backend se aane wale error ke alag-alag shapes ko ek readable
// message me convert karta hai.
function extractErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) => (typeof item === 'string' ? item : item.message || item.msg))
      .filter(Boolean)
      .join(' | ');
  }

  if (data.message) return data.message;
  if (typeof data === 'string') return data;
  return fallback;
}

function calculateAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function DetailRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="pubd-row">
      <span className="pubd-label">{label}</span>
      <span className="pubd-value">{value}</span>
    </div>
  );
}

const lifestyleIcons = {
  diet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 3v8a3 3 0 0 0 6 0V3M10 3v18M17 3c-1.5 2-2 4-2 7 0 3 1 4 2 4s2-1 2-4c0-3-.5-5-2-7z" />
    </svg>
  ),
  smoking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 17h16v3H2zM18 17h4v3h-4zM17 8s1-1 1-2-1-2-1-3M20 8s1-1 1-2-1-2-1-3" />
    </svg>
  ),
  drinking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 3h14l-2 9a5 5 0 0 1-10 0z" />
      <path d="M12 15v6M8 21h8" />
    </svg>
  ),
  activityLevel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 3L4 14h6l-1 7 9-11h-6z" />
    </svg>
  )
};

const lifestyleLabels = {
  diet: { vegetarian: 'Vegetarian', non_vegetarian: 'Non-Vegetarian', eggetarian: 'Eggetarian', vegan: 'Vegan' },
  smoking: { no: 'Non-Smoker', occasionally: 'Smokes Occasionally', yes: 'Smoker' },
  drinking: { no: 'Teetotaler', occasionally: 'Drinks Occasionally', yes: 'Drinks' },
  activityLevel: { sedentary: 'Sedentary', moderate: 'Moderately Active', active: 'Active' }
};

// Public-facing profile page. Shown when someone clicks a ProfileCard
// (route: /profile/:id). This is intentionally a separate component from
// ProfileView (which is the "my profile" page with the Edit flow) — no
// edit button here, instead Message/Call actions.
//
// NOTE: this page intentionally uses the sidebar photo "pub-"/"pubd-" layout
// (the design that used to live on the my-profile page), and ProfileView
// now uses the cover/avatar layout that used to live here. See ProfileView.jsx.
export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      setError('');
      try {
        const data = await getProfileById(id);
        if (isMounted) {
          setProfile(data);
          setActivePhoto(0);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.status === 404
              ? 'This profile could not be found.'
              : extractErrorMessage(err, 'Profile load nahi ho payi. Please try again.')
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // "Connect" button ka sahi state (Connect / Requested / Respond / Matched)
  // - profile load hone ke baad uske user id se fetch karta hai.
  const [connection, setConnection] = useState({ status: 'none' });
  const [connectionLoading, setConnectionLoading] = useState(false);

  useEffect(() => {
    const otherUserId = profile?.user?._id;
    if (!otherUserId) return;

    let isMounted = true;
    getConnectionStatus(otherUserId)
      .then((data) => {
        if (isMounted) setConnection(data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [profile]);

  async function handleConnectClick() {
    const otherUserId = profile?.user?._id;
    if (!otherUserId || connectionLoading) return;

    setConnectionLoading(true);
    try {
      await sendInterest(otherUserId);
      const refreshed = await getConnectionStatus(otherUserId);
      setConnection(refreshed);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'ALREADY_MATCHED') setConnection({ status: 'matched' });
      else if (code === 'ALREADY_SENT') setConnection((c) => ({ ...c, status: 'sent_pending' }));
    } finally {
      setConnectionLoading(false);
    }
  }

  async function handleRespond(action) {
    if (!connection.interestId || connectionLoading) return;
    setConnectionLoading(true);
    try {
      await respondToInterest(connection.interestId, action);
      const otherUserId = profile?.user?._id;
      const refreshed = await getConnectionStatus(otherUserId);
      setConnection(refreshed);
    } catch {
      // silently ignore - button state stays as-is, user can retry
    } finally {
      setConnectionLoading(false);
    }
  }

  if (loading) return <p className="state-message">Loading profile...</p>;

  if (error) {
    return (
      <div className="page-container">
        <p className="state-message">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.user?.name || 'Member';
  const age = calculateAge(profile.user?.dob);
  const photos = profile.photos?.length ? profile.photos : [];
  const activeUrl = photos[activePhoto]?.url;

  const lifestyleEntries = Object.entries(profile.lifestyle || {}).filter(([, v]) => v);

  return (
    <div className="page-container pub-page">
      <button type="button" className="pub-back-link" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="pub-layout">
        {/* ---- Left: photo column ---- */}
        <aside className="pub-photo-col">
          <div className="pub-photo-card">
            <div className="pub-photo-main">
              {activeUrl ? (
                <img src={activeUrl} alt={displayName} />
              ) : (
                <div className="pub-photo-placeholder">{displayName.charAt(0).toUpperCase()}</div>
              )}

              <button type="button" className="pub-share" aria-label="Share profile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                </svg>
              </button>

              {photos.length > 1 && (
                <div className="pub-dots">
                  {photos.map((photo, i) => (
                    <button
                      key={photo._id}
                      type="button"
                      className={`pub-dot ${i === activePhoto ? 'active' : ''}`}
                      onClick={() => setActivePhoto(i)}
                      aria-label={`Show photo ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {photos.length > 1 && (
              <div className="pub-thumbs">
                {photos.map((photo, i) => (
                  <button
                    type="button"
                    key={photo._id}
                    className={`pub-thumb ${i === activePhoto ? 'active' : ''}`}
                    onClick={() => setActivePhoto(i)}
                    aria-label={`Show photo ${i + 1}`}
                  >
                    <img src={photo.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pub-actions">
            {connection.status === 'matched' ? (
              <button type="button" className="btn btn-primary btn-sm pub-connect-matched" disabled>
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M12 21s-7.2-4.5-10-9.3C.4 8.3 2 4.6 5.6 4a5 5 0 0 1 6.4 2A5 5 0 0 1 18.4 4c3.6.6 5.2 4.3 3.6 7.7C19.2 16.5 12 21 12 21z" />
                </svg>
                Matched
              </button>
            ) : connection.status === 'received_pending' ? (
              <div className="pub-respond-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleRespond('accept')}
                  disabled={connectionLoading}
                >
                  Accept Interest
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleRespond('reject')}
                  disabled={connectionLoading}
                >
                  Decline
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConnectClick}
                disabled={connectionLoading || connection.status === 'sent_pending'}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M12 21s-7.2-4.5-10-9.3C.4 8.3 2 4.6 5.6 4a5 5 0 0 1 6.4 2A5 5 0 0 1 18.4 4c3.6.6 5.2 4.3 3.6 7.7C19.2 16.5 12 21 12 21z" />
                </svg>
                {connectionLoading ? 'Please wait...' : connection.status === 'sent_pending' ? 'Requested' : 'Connect'}
              </button>
            )}
            <button type="button" className="btn btn-outline btn-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Message
            </button>
            <button type="button" className="btn btn-primary btn-sm">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10.1a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2z" />
              </svg>
              Call
            </button>
          </div>
        </aside>

        {/* ---- Right: structured info ---- */}
        <div className="pub-main">
          <div className="pub-header">
            <h1>
              {displayName}
              {age ? <span>, {age}</span> : null}
              {profile.user?.profileType && (
                <span className="pub-profile-type-badge">
                  Profile by {PROFILE_TYPE_LABELS[profile.user.profileType] || profile.user.profileType}
                </span>
              )}
            </h1>
            <p className="pub-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {[profile.city, profile.state].filter(Boolean).join(', ') || 'Location not set'}
            </p>
          </div>

          {profile.bio && (
            <section className="pubd-card">
              <h3>About</h3>
              <p className="pubd-bio">{profile.bio}</p>
            </section>
          )}

          <div className="pubd-cards-grid">
            <section className="pubd-card">
              <h3>Personal Details</h3>
              <DetailRow label="Height" value={profile.height ? `${profile.height} cm` : null} />
              <DetailRow label="Marital status" value={profile.maritalStatus?.replaceAll('_', ' ')} />
              <DetailRow label="Mother tongue" value={profile.motherTongue} />
            </section>

            <section className="pubd-card">
              <h3>Religion &amp; Community</h3>
              <DetailRow label="Religion" value={profile.religion} />
              <DetailRow label="Caste" value={profile.caste} />
              <DetailRow label="Sub-caste" value={profile.subCaste} />
            </section>

            <section className="pubd-card">
              <h3>Education &amp; Career</h3>
              <DetailRow label="Occupation" value={profile.occupation} />
              <DetailRow label="Education" value={profile.education} />
              <DetailRow
                label="Annual income"
                value={profile.annualIncome ? `₹ ${profile.annualIncome.toLocaleString('en-IN')}` : null}
              />
            </section>

            <section className="pubd-card">
              <h3>Family Details</h3>
              <div className="pubd-two-col">
                <div>
                  <span className="pubd-mini-label">Father</span>
                  <p className="pubd-mini-value">{profile.familyDetails?.fatherName || '—'}</p>
                </div>
                <div>
                  <span className="pubd-mini-label">Mother</span>
                  <p className="pubd-mini-value">{profile.familyDetails?.motherName || '—'}</p>
                </div>
                <div>
                  <span className="pubd-mini-label">Siblings</span>
                  <p className="pubd-mini-value">{profile.familyDetails?.siblings ?? '—'}</p>
                </div>
                <div>
                  <span className="pubd-mini-label">Family values</span>
                  <p className="pubd-mini-value">{profile.familyDetails?.familyValues || '—'}</p>
                </div>
              </div>
            </section>

            {profile.astroDetails?.enabled && (
              <section className="pubd-card">
                <h3>Astro Details</h3>
                <DetailRow label="Birth time" value={profile.astroDetails?.birthTime} />
                <DetailRow label="Birth place" value={profile.astroDetails?.birthPlace} />
              </section>
            )}
          </div>

          {lifestyleEntries.length > 0 && (
            <section className="pubd-card">
              <h3>Lifestyle</h3>
              <div className="pub-lifestyle-grid">
                {lifestyleEntries.map(([key, value]) => (
                  <div className="pub-lifestyle-chip" key={key}>
                    <span className="pub-lifestyle-icon">{lifestyleIcons[key]}</span>
                    <span>{lifestyleLabels[key]?.[value] || value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile.interests?.length > 0 && (
            <section className="pubd-card">
              <h3>Interests</h3>
              <div className="pub-interest-tags">
                {profile.interests.map((interest) => (
                  <span className="pub-interest-tag" key={interest}>
                    {interest}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
