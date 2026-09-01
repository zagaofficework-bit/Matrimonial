import './Badge.css';

const TONE_MAP = {
  active: 'success',
  approved: 'success',
  verified: 'success',
  paid: 'success',
  resolved: 'success',
  action_taken: 'success',

  pending: 'warning',
  pending_approval: 'warning',
  created: 'warning',
  incomplete: 'warning',

  suspended: 'error',
  blocked: 'error',
  deleted: 'error',
  rejected: 'error',
  failed: 'error',

  dismissed: 'muted',
  not_submitted: 'muted',
  reviewed: 'default'
};

export default function Badge({ value, tone }) {
  const resolvedTone = tone || TONE_MAP[value] || 'default';
  return <span className={`badge badge-${resolvedTone}`}>{String(value).replace(/_/g, ' ')}</span>;
}
