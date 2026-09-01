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

// Har field ke liye validation rule - agar koi problem hai to uska readable
// message return karta hai, warna null (matlab field theek hai).
function validateField(name, value, form) {
  switch (name) {
    case 'name':
      if (!value.trim()) return 'Naam zaruri hai.';
      if (value.trim().length < 2) return 'Naam kam se kam 2 characters ka hona chahiye.';
      return null;
    case 'gender':
      if (!value) return 'Gender select karo.';
      return null;
    case 'dob': {
      if (!value) return 'Date of birth zaruri hai.';
      const age = Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      if (Number.isNaN(age)) return 'Sahi date of birth daalo.';
      if (age < 18) return 'Registration ke liye 18 saal ya usse zyada age zaruri hai.';
      if (age > 100) return 'Sahi date of birth daalo.';
      return null;
    }
    case 'profileType':
      if (!value) return 'Profile kiske liye hai, ye select karo.';
      return null;
    case 'phone':
      if (!value.trim()) return 'Phone number zaruri hai.';
      if (!/^[6-9]\d{9}$/.test(value.trim())) return '10 digit ka valid Indian phone number daalo.';
      return null;
    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Sahi email format daalo.';
      return null;
    case 'password':
      if (!value) return 'Password zaruri hai.';
      if (value.length < 8) return 'Password kam se kam 8 characters ka hona chahiye.';
      return null;
    case 'city':
      return null;
    default:
      return null;
  }
}

function validateForm(form) {
  const errors = {};
  Object.keys(form).forEach((key) => {
    const message = validateField(key, form[key], form);
    if (message) errors[key] = message;
  });
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Field me kuch type karte hi uska apna error clear/update ho jaye
    setFieldErrors((prev) => {
      const message = validateField(name, value, form);
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Kripya form me highlighted galtiyaan theek karo.');
      return;
    }

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
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.name)}
                  required
                />
                {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.gender)}
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {fieldErrors.gender && <span className="field-error">{fieldErrors.gender}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label htmlFor="dob">Date of birth</label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.dob)}
                  required
                />
                {fieldErrors.dob && <span className="field-error">{fieldErrors.dob}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="profileType">Profile is for</label>
                <select
                  id="profileType"
                  name="profileType"
                  value={form.profileType}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.profileType)}
                  required
                >
                  <option value="">Select</option>
                  <option value="self">Myself</option>
                  <option value="parent">My child</option>
                  <option value="sibling">My sibling</option>
                  <option value="relative">My relative</option>
                  <option value="friend">My friend</option>
                </select>
                {fieldErrors.profileType && <span className="field-error">{fieldErrors.profileType}</span>}
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
                  aria-invalid={Boolean(fieldErrors.phone)}
                  required
                />
                {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="email">Email (optional)</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
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
                  aria-invalid={Boolean(fieldErrors.password)}
                  required
                />
                {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
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
