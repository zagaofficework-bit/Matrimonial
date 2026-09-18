import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReceivedInterests, getSentInterests, respondToInterest } from '../../api/interest.api';
import './Interests.css';

function calculateAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Declined'
};

function InterestRow({ item, showActions, onAccept, onDecline, actionLoading, navigate }) {
  const primaryPhoto =
    item.profile?.photos?.find((p) => p.isPrimary)?.url || item.profile?.photos?.[0]?.url || null;
  const name = item.user?.name || 'Member';
  const age = calculateAge(item.user?.dob);
  const isBusy = actionLoading === item._id;

  function goToProfile() {
    if (item.profile?._id) navigate(`/profile/${item.profile._id}`);
  }

  return (
    <div className="interest-row">
      <button type="button" className="interest-row-avatar" onClick={goToProfile} aria-label={`View ${name}'s profile`}>
        {primaryPhoto ? <img src={primaryPhoto} alt={name} /> : <span>{name.charAt(0).toUpperCase()}</span>}
      </button>

      <div className="interest-row-info">
        <p className="interest-row-name">
          {name}
          {age ? `, ${age}` : ''}
        </p>
        <p className="interest-row-meta">
          {[item.profile?.occupation, item.profile?.city].filter(Boolean).join(' • ') || 'Profile details coming soon'}
        </p>
      </div>

      {showActions ? (
        <div className="interest-row-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onAccept(item._id)}
            disabled={isBusy}
          >
            {isBusy ? 'Accepting...' : 'Accept'}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onDecline(item._id)}
            disabled={isBusy}
          >
            {isBusy ? 'Declining...' : 'Decline'}
          </button>
        </div>
      ) : (
        <span className={`interest-status-badge interest-status-${item.status}`}>
          {STATUS_LABELS[item.status] || item.status}
        </span>
      )}
    </div>
  );
}

export default function Interests() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [receivedData, sentData] = await Promise.all([getReceivedInterests(), getSentInterests()]);
      setReceived(receivedData);
      setSent(sentData);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load interests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleAccept(interestId) {
    // Guard against double-clicks: if any action is already in flight,
    // ignore this click instead of firing a duplicate request.
    if (actionLoading) return;

    setActionLoading(interestId);
    try {
      await respondToInterest(interestId, 'accept');
      setReceived((prev) => prev.filter((item) => item._id !== interestId));
    } catch (err) {
      // Backend says this interest was already processed (e.g. from a
      // duplicate click) - it's already accepted on the server, so just
      // remove it from the list instead of showing an error.
      if (err.response?.data?.error?.code === 'INVALID_STATUS') {
        setReceived((prev) => prev.filter((item) => item._id !== interestId));
      } else {
        setError(err.response?.data?.message || 'Could not accept. Please try again.');
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDecline(interestId) {
    if (actionLoading) return;

    setActionLoading(interestId);
    try {
      await respondToInterest(interestId, 'reject');
      setReceived((prev) => prev.filter((item) => item._id !== interestId));
    } catch (err) {
      if (err.response?.data?.error?.code === 'INVALID_STATUS') {
        setReceived((prev) => prev.filter((item) => item._id !== interestId));
      } else {
        setError(err.response?.data?.message || 'Could not decline. Please try again.');
      }
    } finally {
      setActionLoading(null);
    }
  }

  const activeList = tab === 'received' ? received : sent;

  return (
    <div className="page-container">
      <div className="interests-header">
        <h2>Interests</h2>
        <p className="interests-subtitle">Manage the connect requests you've sent and received</p>
      </div>

      <div className="interests-tabs">
        <button
          type="button"
          className={`interests-tab ${tab === 'received' ? 'active' : ''}`}
          onClick={() => setTab('received')}
        >
          Received {received.length > 0 && `(${received.length})`}
        </button>
        <button
          type="button"
          className={`interests-tab ${tab === 'sent' ? 'active' : ''}`}
          onClick={() => setTab('sent')}
        >
          Sent {sent.length > 0 && `(${sent.length})`}
        </button>
      </div>

      {loading && <p className="state-message">Loading...</p>}
      {!loading && error && <p className="state-message">{error}</p>}

      {!loading && !error && activeList.length === 0 && (
        <p className="state-message">
          {tab === 'received' ? 'No interests received yet.' : "You haven't sent any interests yet."}
        </p>
      )}

      {!loading && !error && activeList.length > 0 && (
        <div className="interests-list">
          {activeList.map((item) => (
            <InterestRow
              key={item._id}
              item={item}
              showActions={tab === 'received'}
              onAccept={handleAccept}
              onDecline={handleDecline}
              actionLoading={actionLoading}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}