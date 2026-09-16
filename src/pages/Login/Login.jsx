import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, isStaff } from '../../context/AuthContext';
import { getMyProfile } from '../../api/profile.api';
import AuthSidePanel from '../../components/AuthSidePanel/AuthSidePanel';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((prev) => {
      if (value.trim()) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return prev;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const errors = {};
    if (!form.identifier.trim()) errors.identifier = 'Enter phone or email.';
    if (!form.password) errors.password = 'Enter password.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const loggedInUser = await login(form.identifier, form.password);

      // Staff (moderator/admin/super_admin) seedha admin dashboard pe jaate hain.
      if (isStaff(loggedInUser)) {
        navigate('/admin');
        return;
      }

      // Normal member - check karo profile bani hai ya nahi, tabhi decide karo kaha bhejna hai.
      try {
        await getMyProfile();
        navigate('/');
      } catch {
        // Profile abhi tak nahi bani (404) - pehle profile create karwao.
        navigate('/profile/create');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <AuthSidePanel />

      <div className="auth-form-side">
        <div className="auth-card">
          <span className="auth-card-eyebrow">Welcome Back</span>
          <h1 className="auth-card-title">Login to your account</h1>
          <p className="auth-subtitle">Enter your details to continue.</p>

          {error && <div className="field-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="identifier">Phone or Email</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={form.identifier}
                onChange={handleChange}
                placeholder="Enter phone number or email"
                autoComplete="username"
                aria-invalid={Boolean(fieldErrors.identifier)}
              />
              {fieldErrors.identifier && (
                <span className="field-error">{fieldErrors.identifier}</span>
              )}
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={Boolean(fieldErrors.password)}
              />
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            <button type="submit" className="btn-block" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}