import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendInterest } from '../../api/interest.api';
import { saveProfile, unsaveProfile } from '../../api/savedProfile.api';
import './ProfileCard.css';

function calculateAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

// error.response?.data?.error?.code se aane wale codes ko button label me
// dikhane laayak text me convert karta hai (ApiError se aate hain).
const CONNECT_ERROR_LABELS = {
  ALREADY_SENT: 'Requested',
  ALREADY_MATCHED: 'Matched'
};

// variant="matched" - Matches page par reuse hone ke liye: Connect/Save
// buttons ki jagah ek "Matched" pill dikhata hai. Home/Search dono is prop
// ke bina hi pehle jaisa call karte rehte hain, to unka behaviour same rehta hai.
// matchPercentage - Home page se aata hai (partner preference ke against
// calculate hua %, 0-100). null/undefined ho to badge simply nahi dikhta -
// Search/Matches/SavedProfiles jaisi jagah is prop ke bina hi pehle jaisa
// call karte rehte hain, unka behaviour same rehta hai.
export default function ProfileCard({
  profile,
  variant = 'default',
  initiallySaved = false,
  onUnsave,
  matchPercentage = null
}) {
  const navigate = useNavigate();
  const [connectState, setConnectState] = useState('idle'); // idle | loading | sent | error
  const [connectLabel, setConnectLabel] = useState('Connect');
  const [connectError, setConnectError] = useState('');
  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    setIsSaved(initiallySaved);
  }, [initiallySaved]);

  const primaryPhoto =
    profile.photos?.find((p) => p.isPrimary)?.url || profile.photos?.[0]?.url || null;

  const age = calculateAge(profile.user?.dob);
  const name = profile.user?.name || 'Unnamed';

  function goToProfile() {
    navigate(`/profile/${profile._id}`);
  }

  async function handleConnect(e) {
    e.stopPropagation();
    if (connectState === 'loading' || connectState === 'sent') return;

    const receiverId = profile.user?._id;
    if (!receiverId) return;

    setConnectState('loading');
    setConnectError('');
    try {
      await sendInterest(receiverId);
      setConnectLabel('Requested');
      setConnectState('sent');
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (CONNECT_ERROR_LABELS[code]) {
        // Already sent / already matched - the request effectively already
        // went through earlier, so it's fine to show it as "sent".
        setConnectLabel(CONNECT_ERROR_LABELS[code]);
        setConnectState('sent');
      } else {
        // Unknown/real failure (network issue, server error, expired
        // session, etc.) - don't lie to the user by pretending it sent.
        // Reset to idle so they can see the error and retry.
        setConnectState('idle');
        setConnectLabel('Connect');
        setConnectError(err.response?.data?.message || 'Could not send request. Please try again.');
      }
    }
  }

  async function handleToggleSave(e) {
    e.stopPropagation();
    if (saveLoading) return;

    setSaveLoading(true);
    try {
      if (isSaved) {
        await unsaveProfile(profile._id);
        setIsSaved(false);
        onUnsave?.(profile._id);
      } else {
        await saveProfile(profile._id);
        setIsSaved(true);
      }
    } catch (err) {
      // Save/unsave dono idempotent hain backend pe (already-saved ya
      // not-saved dono ko gracefully handle karte hain), isliye yahan
      // UI ko silently wapas sync kar dete hain agar kuch mismatch ho.
      const code = err.response?.data?.error?.code;
      if (code === 'NOT_SAVED') setIsSaved(false);
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className="profile-card">
      <div className="profile-card-image" onClick={goToProfile}>
        {typeof matchPercentage === 'number' && (
          <span className="profile-card-match-badge">{matchPercentage}% Match</span>
        )}
        {primaryPhoto ? (
          <img src={primaryPhoto} alt={name} />
        ) : (
          <div className="profile-card-placeholder">{name.charAt(0).toUpperCase()}</div>
        )}

        <div className="profile-card-overlay">
          <h3 className="profile-card-name">
            {name}
            {age ? `, ${age}` : ''}
          </h3>
          <svg className="profile-card-verified" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.6 1.4 2.9-.3 1.2 2.6 2.6 1.4-.6 2.9.6 2.9-2.6 1.4-1.2 2.6-2.9-.3L12 22l-2.6-1.4-2.9.3-1.2-2.6L2.7 16.9l.6-2.9-.6-2.9 2.6-1.4 1.2-2.6 2.9.3z" />
            <path d="M9 12.3l2 2 4-4.2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="profile-card-body">
        {profile.occupation && (
          <p className="profile-card-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {profile.occupation}
          </p>
        )}
        <p className="profile-card-meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {[profile.height ? `${profile.height} cm` : null, profile.religion].filter(Boolean).join(' • ') ||
            'Details coming soon'}
        </p>
        {profile.city && (
          <p className="profile-card-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {profile.city}
          </p>
        )}

        <div className="profile-card-actions">
          {variant === 'matched' ? (
            <button type="button" className="btn btn-primary btn-sm profile-card-matched-pill" onClick={goToProfile}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 21s-7.2-4.5-10-9.3C.4 8.3 2 4.6 5.6 4a5 5 0 0 1 6.4 2A5 5 0 0 1 18.4 4c3.6.6 5.2 4.3 3.6 7.7C19.2 16.5 12 21 12 21z" />
              </svg>
              Matched
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConnect}
                disabled={connectState === 'loading' || connectState === 'sent'}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M12 21s-7.2-4.5-10-9.3C.4 8.3 2 4.6 5.6 4a5 5 0 0 1 6.4 2A5 5 0 0 1 18.4 4c3.6.6 5.2 4.3 3.6 7.7C19.2 16.5 12 21 12 21z" />
                </svg>
                {connectState === 'loading' ? 'Sending...' : connectLabel}
              </button>
              {connectError && <span className="profile-card-connect-error">{connectError}</span>}
              <button
                type="button"
                className={`profile-card-save ${isSaved ? 'is-saved' : ''}`}
                aria-label={isSaved ? 'Unsave profile' : 'Save profile'}
                onClick={handleToggleSave}
                disabled={saveLoading}
              >
                <svg viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M11.5 3l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.6 5-.7z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}