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
      // Backend jaan-bujh kar ye batata nahi ki email exist karta hai ya
      // nahi (security), isliye success hi dikhate hain hamesha.
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Kuch galat ho gaya. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-outer">
        <div className="forgot-password-card">
          <h1>Password bhool gaye?</h1>

          {submitted ? (
            <p className="forgot-password-success">
              Agar is email se account hai, to reset link bhej diya gaya hai. Apna inbox check karo (30 minute ke liye valid hai).
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="forgot-password-subtitle">
                Apna registered email daalo, hum tumhe password reset link bhej denge.
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

              {error && <p className="forgot-password-error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? 'Bhej rahe hain...' : 'Reset link bhejo'}
              </button>
            </form>
          )}

          <Link to="/login" className="forgot-password-back">
            &larr; Login pe wapas jao
          </Link>
        </div>
      </div>
    </div>
  );
}