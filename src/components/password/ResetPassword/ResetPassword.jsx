import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resetPasswordWithToken } from "../../../api/auth.api";
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
      setError('Password kam se kam 8 characters ka hona chahiye.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Dono password same nahi hain.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithToken(token, newPassword);
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Link invalid ya expire ho chuka hai. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-outer">
        <div className="reset-password-card">
          <h1>Naya password set karo</h1>

          {done ? (
            <p className="reset-password-success">
              Password reset ho gaya! Login page pe bhej rahe hain...
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label htmlFor="rp-new">Naya password</label>
              <input
                id="rp-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Kam se kam 8 characters"
              />

              <label htmlFor="rp-confirm">Naya password dobara</label>
              <input
                id="rp-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />

              {error && <p className="reset-password-error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? 'Set kar rahe hain...' : 'Password reset karo'}
              </button>
            </form>
          )}

          <Link to="/login" className="reset-password-back">
            &larr; Login pe wapas jao
          </Link>
        </div>
      </div>
    </div>
  );
}