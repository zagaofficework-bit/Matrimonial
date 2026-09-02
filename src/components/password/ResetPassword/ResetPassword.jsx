import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resetPasswordWithToken } from '../../../api/auth.api';
import './ResetPassword.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Both passwords must match.');
      return;
    }

    setLoading(true);

    try {
      await resetPasswordWithToken(token, newPassword);
      setDone(true);

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'The reset link is invalid or has expired. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-outer">
        <div className="reset-password-card">
          <h1>Set a New Password</h1>

          {done ? (
            <p className="reset-password-success">
              Your password has been reset successfully! Redirecting you
              to the login page...
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label htmlFor="rp-new">New Password</label>

              <input
                id="rp-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
              />

              <label htmlFor="rp-confirm">
                Confirm New Password
              </label>

              <input
                id="rp-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Re-enter your password"
              />

              {error && (
                <p className="reset-password-error">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <Link to="/login" className="reset-password-back">
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}