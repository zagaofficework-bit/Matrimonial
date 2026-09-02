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

// Validation rules for each field.
// Returns a readable error message if invalid, otherwise null.
function validateField(name, value, form) {
  switch (name) {
    case 'name':
      if (!value.trim()) return 'Name is required.';
      if (value.trim().length < 2) {
        return 'Name must be at least 2 characters long.';
      }
      return null;

    case 'gender':
      if (!value) return 'Please select your gender.';
      return null;

    case 'dob': {
      if (!value) return 'Date of birth is required.';

      const age = Math.floor(
        (Date.now() - new Date(value).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      );

      if (Number.isNaN(age)) {
        return 'Please enter a valid date of birth.';
      }

      if (age < 18) {
        return 'You must be at least 18 years old to register.';
      }

      if (age > 100) {
        return 'Please enter a valid date of birth.';
      }

      return null;
    }

    case 'profileType':
      if (!value) {
        return 'Please select who this profile is for.';
      }
      return null;

    case 'phone':
      if (!value.trim()) {
        return 'Phone number is required.';
      }

      if (!/^[6-9]\d{9}$/.test(value.trim())) {
        return 'Please enter a valid 10-digit Indian phone number.';
      }

      return null;

    case 'email':
      if (
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ) {
        return 'Please enter a valid email address.';
      }

      return null;

    case 'password':
      if (!value) {
        return 'Password is required.';
      }

      if (value.length < 8) {
        return 'Password must be at least 8 characters long.';
      }

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

    if (message) {
      errors[key] = message;
    }
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

    setForm((f) => ({
      ...f,
      [name]: value
    }));

    // Clear or update the field error as the user types.
    setFieldErrors((prev) => {
      const message = validateField(name, value, {
        ...form,
        [name]: value
      });

      const next = { ...prev };

      if (message) {
        next[name] = message;
      } else {
        delete next[name];
      }

      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const errors = validateForm(form);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError('Please fix the highlighted errors in the form.');
      return;
    }

    setLoading(true);

    try {
      const payload = { ...form };

      if (!payload.email) {
        delete payload.email;
      }

      if (!payload.city) {
        delete payload.city;
      }

      await register(payload);

      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Please try again.'
      );
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

          <h1 className="auth-card-title">
            Create your account
          </h1>

          <p className="auth-subtitle">
            A few details to get you started
          </p>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

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

                {fieldErrors.name && (
                  <span className="field-error">
                    {fieldErrors.name}
                  </span>
                )}
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

                {fieldErrors.gender && (
                  <span className="field-error">
                    {fieldErrors.gender}
                  </span>
                )}
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

                {fieldErrors.dob && (
                  <span className="field-error">
                    {fieldErrors.dob}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="profileType">
                  Profile is for
                </label>

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

                {fieldErrors.profileType && (
                  <span className="field-error">
                    {fieldErrors.profileType}
                  </span>
                )}
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

                {fieldErrors.phone && (
                  <span className="field-error">
                    {fieldErrors.phone}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="email">
                  Email (optional)
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.email)}
                />

                {fieldErrors.email && (
                  <span className="field-error">
                    {fieldErrors.email}
                  </span>
                )}
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

                {fieldErrors.password && (
                  <span className="field-error">
                    {fieldErrors.password}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="city">
                  City (optional)
                </label>

                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}