import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../../api/auth.api';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);

      // The backend intentionally does not reveal whether
      // the email exists for security reasons, so we always show success.
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-outer">
        <div className="forgot-password-card">
          <h1>Forgot Password?</h1>

          {submitted ? (
            <p className="forgot-password-success">
              If an account exists with this email, a password reset link
              has been sent. Please check your inbox. The link is valid
              for 30 minutes.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="forgot-password-subtitle">
                Enter your registered email address and we will send you
                a password reset link.
              </p>

              <label htmlFor="fp-email">Email</label>

              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />

              {error && (
                <p className="forgot-password-error">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <Link to="/login" className="forgot-password-back">
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}