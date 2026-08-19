import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthSidePanel from '../../components/AuthSidePanel/AuthSidePanel';
import '../Login/Login.css';
import './Register.css';

const initialForm = {
  name: '',
  gender: '',
  dob: '',
  phone: '',
  email: '',
  password: '',
  profileType: '',
  city: ''
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.email) delete payload.email;
      if (!payload.city) delete payload.city;
      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration fail ho gaya. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <AuthSidePanel
        eyebrow="Join us"
        title="Where two families come together as one."
        subtitle="Create your profile in a few minutes and start connecting with genuine matches."
      />

      <div className="auth-form-side">
        <div className="auth-card auth-card-wide">
          <span className="auth-card-eyebrow">Get Started</span>
          <h1 className="auth-card-title">Create your account</h1>
          <p className="auth-subtitle">A few details to get you started</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field-group">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="field-group">
                <label htmlFor="gender">Gender</label>
                <select id="gender" name="gender" value={form.gender} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label htmlFor="dob">Date of birth</label>
                <input id="dob" name="dob" type="date" value={form.dob} onChange={handleChange} required />
              </div>

              <div className="field-group">
                <label htmlFor="profileType">Profile is for</label>
                <select
                  id="profileType"
                  name="profileType"
                  value={form.profileType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="self">Myself</option>
                  <option value="parent">My child</option>
                  <option value="sibling">My sibling</option>
                  <option value="relative">My relative</option>
                  <option value="friend">My friend</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="email">Email (optional)</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="city">City (optional)</label>
                <input id="city" name="city" value={form.city} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
