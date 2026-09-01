import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyProfile } from '../../api/profile.api';
import { getStoriesByUserId } from '../../api/successStory.api';
import { useAuth } from '../../context/AuthContext';
import './ProfileView.css';

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
    <div className="mv-detail-row">
      <span className="mv-detail-label">{label}</span>
      <span className="mv-detail-value">{value}</span>
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

// "My profile" page only (route: /profile/me). Includes the Edit Profile
// flow. For viewing other members' profiles, see pages/profile/PublicProfile.
//
// NOTE: this page intentionally uses the cover/avatar "mv-" layout (the
// design that used to live on the public profile page), and PublicProfile
// now uses the sidebar layout that used to live here. See PublicProfile.jsx.
export default function ProfileView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myStoryEntries, setMyStoryEntries] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      setError('');
      try {
        const data = await getMyProfile();
        if (isMounted) {
          setProfile(data);
          setActivePhoto(0);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.status === 404
              ? "This profile hasn't been created yet."
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
  }, []);

  // Success stories jinme ye member creator ya tagged partner hai - "About Me"
  // ke upar ek chota card ke roop me dikhti hain.
  useEffect(() => {
    const myUserId = profile?.user?._id || user?._id;
    if (!myUserId) return;

    let isMounted = true;
    getStoriesByUserId(myUserId)
      .then((stories) => {
        if (isMounted) setMyStoryEntries(stories);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [profile, user]);

  if (loading) return <p className="state-message">Loading profile...</p>;

  if (error) {
    return (
      <div className="page-container">
        <p className="state-message">{error}</p>
        <div className="mv-cta">
          <button className="btn btn-primary" onClick={() => navigate('/profile/create')}>
            Create your profile
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Agar backend "user" ko populate karke nahi bhejta, to logged-in user ki
  // details (AuthContext) se fallback le lo, taaki naam/age/etc. khali na dikhein.
  const displayName = profile.user?.name || user?.name || 'Member';
  const displayDob = profile.user?.dob || user?.dob;
  const age = calculateAge(displayDob);
  const photos = profile.photos?.length ? profile.photos : [];
  const activeUrl = photos[activePhoto]?.url;

  const lifestyleEntries = Object.entries(profile.lifestyle || {}).filter(([, v]) => v);
  const displayPhone = profile.user?.phone || user?.phone;
  const displayEmail = profile.user?.email || user?.email;

  return (
    <div className="mv-page">
      <div className="page-container">
        {/* ---- Cover + header ---- */}
        <div className="mv-cover" />

        <div className="mv-header-card">
          <div className="mv-avatar">
            {activeUrl ? (
              <img src={activeUrl} alt={displayName} />
            ) : (
              <div className="mv-avatar-placeholder">{displayName.charAt(0).toUpperCase()}</div>
            )}
          </div>

          <div className="mv-header-info">
            <h1>
              {displayName}
              {age ? <span>, {age}</span> : null}
            </h1>
            <p className="mv-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {[profile.city, profile.state].filter(Boolean).join(', ') || 'Location not set'}
            </p>
            {profile.occupation && (
              <p className="mv-occupation">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                {profile.occupation}
              </p>
            )}
          </div>

          <div className="mv-header-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/profile/create')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>

        {/* ---- Photo strip (only if more than 1 photo) ---- */}
        {photos.length > 1 && (
          <div className="mv-photo-strip">
            {photos.map((photo, i) => (
              <button
                type="button"
                key={photo._id}
                className={`mv-photo-thumb ${i === activePhoto ? 'active' : ''}`}
                onClick={() => setActivePhoto(i)}
                aria-label={`Show photo ${i + 1}`}
              >
                <img src={photo.url} alt="" />
              </button>
            ))}
          </div>
        )}

        {/* ---- Body ---- */}
        <div className="mv-body">
          {myStoryEntries.length > 0 && (
            <section className="mv-card mv-success-story-card">
              <h3>Success Story</h3>
              {myStoryEntries.map((story) => (
                <Link to={`/success-stories/${story._id}`} className="mv-success-story-item" key={story._id}>
                  <img src={story.image} alt={story.coupleNames} />
                  <div>
                    <span className="mv-success-story-names">{story.coupleNames}</span>
                    <span className="mv-success-story-view">View story →</span>
                  </div>
                </Link>
              ))}
            </section>
          )}

          {profile.bio && (
            <section className="mv-card mv-bio-card">
              <h3>About Me</h3>
              <p className="mv-bio">{profile.bio}</p>
            </section>
          )}

          <div className="mv-cards-grid">
            <section className="mv-card">
              <h3>Personal Details</h3>
              <DetailRow label="Height" value={profile.height ? `${profile.height} cm` : null} />
              <DetailRow label="Marital status" value={profile.maritalStatus?.replaceAll('_', ' ')} />
              <DetailRow label="Mother tongue" value={profile.motherTongue} />
              <DetailRow label="Phone" value={displayPhone} />
              <DetailRow label="Email" value={displayEmail} />
            </section>

            <section className="mv-card">
              <h3>Religion &amp; Community</h3>
              <DetailRow label="Religion" value={profile.religion} />
              <DetailRow label="Caste" value={profile.caste} />
              <DetailRow label="Sub-caste" value={profile.subCaste} />
            </section>

            <section className="mv-card">
              <h3>Education &amp; Career</h3>
              <DetailRow label="Occupation" value={profile.occupation} />
              <DetailRow label="Education" value={profile.education} />
              <DetailRow
                label="Annual income"
                value={profile.annualIncome ? `₹ ${profile.annualIncome.toLocaleString('en-IN')}` : null}
              />
            </section>

            <section className="mv-card">
              <h3>Family Details</h3>
              <div className="mv-detail-two-col">
                <div>
                  <span className="mv-mini-label">Father</span>
                  <p className="mv-mini-value">{profile.familyDetails?.fatherName || '—'}</p>
                </div>
                <div>
                  <span className="mv-mini-label">Mother</span>
                  <p className="mv-mini-value">{profile.familyDetails?.motherName || '—'}</p>
                </div>
                <div>
                  <span className="mv-mini-label">Siblings</span>
                  <p className="mv-mini-value">{profile.familyDetails?.siblings ?? '—'}</p>
                </div>
                <div>
                  <span className="mv-mini-label">Family values</span>
                  <p className="mv-mini-value">{profile.familyDetails?.familyValues || '—'}</p>
                </div>
              </div>
            </section>

            {profile.astroDetails?.enabled && (
              <section className="mv-card">
                <h3>Astro Details</h3>
                <DetailRow label="Birth time" value={profile.astroDetails?.birthTime} />
                <DetailRow label="Birth place" value={profile.astroDetails?.birthPlace} />
              </section>
            )}
          </div>

          {lifestyleEntries.length > 0 && (
            <section className="mv-card">
              <h3>Lifestyle</h3>
              <div className="mv-lifestyle-grid">
                {lifestyleEntries.map(([key, value]) => (
                  <div className="mv-lifestyle-chip" key={key}>
                    <span className="mv-lifestyle-icon">{lifestyleIcons[key]}</span>
                    <span>{lifestyleLabels[key]?.[value] || value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile.interests?.length > 0 && (
            <section className="mv-card">
              <h3>Interests</h3>
              <div className="mv-interest-tags">
                {profile.interests.map((interest) => (
                  <span className="mv-interest-tag" key={interest}>
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