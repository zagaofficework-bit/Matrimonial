import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, isStaff } from '../../context/AuthContext';
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
    if (!form.identifier.trim()) errors.identifier = 'Phone ya email daalo.';
    if (!form.password) errors.password = 'Password daalo.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const loggedInUser = await login(form.identifier, form.password);
      // Staff (moderator/admin/super_admin) seedha admin dashboard pe
      // jaate hain; normal members apne home page pe.
      navigate(isStaff(loggedInUser) ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login fail ho gaya. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <AuthSidePanel
        eyebrow="Welcome back"
        title="Every great story starts with a single step."
        subtitle="Sign in to continue your search for a partner who shares your values."
      />

      <div className="auth-form-side">
        <div className="auth-card">
          <span className="auth-card-eyebrow">Member Login</span>
          <h1 className="auth-card-title">Sign in to your account</h1>
          <p className="auth-subtitle">Enter your details to continue</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="identifier">Phone or Email</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={form.identifier}
                onChange={handleChange}
                placeholder="9876543210 or you@email.com"
                aria-invalid={Boolean(fieldErrors.identifier)}
                required
              />
              {fieldErrors.identifier && <span className="field-error">{fieldErrors.identifier}</span>}
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
                placeholder="********"
                aria-invalid={Boolean(fieldErrors.password)}
                required
              />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}