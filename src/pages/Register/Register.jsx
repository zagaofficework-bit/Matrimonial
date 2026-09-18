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


// ======================================================
// FIELD VALIDATION
// ======================================================

function validateField(name, value, form) {
  switch (name) {
    case 'name':
      if (!value.trim()) {
        return 'Name is required.';
      }

      if (value.trim().length < 2) {
        return 'Name must be at least 2 characters long.';
      }

      return null;


    case 'gender':
      if (!value) {
        return 'Please select your gender.';
      }

      return null;


    case 'dob': {
      if (!value) {
        return 'Date of birth is required.';
      }

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
      if (!value.trim()) {
        return 'Email address is required.';
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
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


// ======================================================
// FORM VALIDATION
// ======================================================

function validateForm(form) {
  const errors = {};

  Object.keys(form).forEach((key) => {
    const message = validateField(
      key,
      form[key],
      form
    );

    if (message) {
      errors[key] = message;
    }
  });

  return errors;
}


// ======================================================
// REGISTER COMPONENT
// ======================================================

export default function Register() {
  const { register } = useAuth();

  const navigate = useNavigate();


  // Form
  const [form, setForm] = useState(initialForm);


  // Validation
  const [fieldErrors, setFieldErrors] = useState({});


  // General error
  const [error, setError] = useState('');


  // Registration loading
  const [loading, setLoading] = useState(false);


  // ====================================================
  // EMAIL OTP STATE
  // ====================================================

  // idle | sent | verified
  const [otpStep, setOtpStep] = useState('idle');

  const [otp, setOtp] = useState('');

  const [otpError, setOtpError] = useState('');

  const [otpLoading, setOtpLoading] = useState(false);

  const [emailVerificationToken, setEmailVerificationToken] =
    useState('');


  // ====================================================
  // API BASE URL
  // ====================================================

  // const API_BASE_URL =
  //   import.meta.env.VITE_API_URL ||
  //   'http://localhost:5000/api';


    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // ====================================================
  // HANDLE INPUT CHANGE
  // ====================================================

  function handleChange(e) {
    const { name, value } = e.target;


    setForm((f) => ({
      ...f,
      [name]: value
    }));


    // -----------------------------------------------
    // Email change
    // Old OTP verification becomes invalid
    // -----------------------------------------------

    if (name === 'email' && otpStep !== 'idle') {
      setOtpStep('idle');

      setOtp('');

      setEmailVerificationToken('');

      setOtpError('');
    }


    // -----------------------------------------------
    // Phone change
    // Old OTP verification becomes invalid
    // -----------------------------------------------

    if (name === 'phone' && otpStep !== 'idle') {
      setOtpStep('idle');

      setOtp('');

      setEmailVerificationToken('');

      setOtpError('');
    }


    // -----------------------------------------------
    // Field validation
    // -----------------------------------------------

    setFieldErrors((prev) => {
      const message = validateField(
        name,
        value,
        {
          ...form,
          [name]: value
        }
      );

      const next = {
        ...prev
      };

      if (message) {
        next[name] = message;
      } else {
        delete next[name];
      }

      return next;
    });
  }


  // ====================================================
  // SEND EMAIL OTP
  // ====================================================

  async function handleSendOtp() {
    setOtpError('');

    setError('');


    // Validate email
    const emailError = validateField(
      'email',
      form.email,
      form
    );

    if (emailError) {
      setFieldErrors((prev) => ({
        ...prev,
        email: emailError
      }));

      return;
    }


    // Validate phone
    const phoneError = validateField(
      'phone',
      form.phone,
      form
    );

    if (phoneError) {
      setFieldErrors((prev) => ({
        ...prev,
        phone: phoneError
      }));

      return;
    }


    // Validate name
    const nameError = validateField(
      'name',
      form.name,
      form
    );

    if (nameError) {
      setFieldErrors((prev) => ({
        ...prev,
        name: nameError
      }));

      return;
    }


    setOtpLoading(true);


    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/send-email-otp`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            email: form.email.trim(),
            name: form.name.trim(),
            phone: form.phone.trim()
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Could not send OTP. Please try again.'
        );
      }


      // OTP successfully sent
      setOtpStep('sent');

      setOtp('');

      setEmailVerificationToken('');

      setOtpError('');


    } catch (err) {
      setOtpError(
        err.message ||
          'Could not send OTP. Please try again.'
      );


    } finally {
      setOtpLoading(false);
    }
  }


  // ====================================================
  // VERIFY EMAIL OTP
  // ====================================================

  async function handleVerifyOtp() {
    setOtpError('');

    setError('');


    if (!otp.trim()) {
      setOtpError('Please enter the OTP.');

      return;
    }


    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError(
        'Please enter a valid 6-digit OTP.'
      );

      return;
    }


    setOtpLoading(true);


    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/verify-email-otp`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            email: form.email.trim(),
            phone: form.phone.trim(),
            otp: otp.trim()
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Invalid or expired OTP.'
        );
      }


      // -----------------------------------------------
      // Get verification token
      // -----------------------------------------------

      const verificationToken =
        data?.data?.emailVerificationToken ||
        data?.emailVerificationToken;


      if (!verificationToken) {
        throw new Error(
          'Email verification token was not received from server.'
        );
      }


      setEmailVerificationToken(
        verificationToken
      );

      setOtpStep('verified');

      setOtpError('');


    } catch (err) {
      setOtpError(
        err.message ||
          'Invalid or expired OTP. Please try again.'
      );


    } finally {
      setOtpLoading(false);
    }
  }


  // ====================================================
  // REGISTER
  // ====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');


    // Validate complete form
    const errors = validateForm(form);

    setFieldErrors(errors);


    if (Object.keys(errors).length > 0) {
      setError(
        'Please fix the highlighted errors in the form.'
      );

      return;
    }


    // -----------------------------------------------
    // Email OTP verification check
    // -----------------------------------------------

    if (
      otpStep !== 'verified' ||
      !emailVerificationToken
    ) {
      setError(
        'Please verify your email with OTP before registering.'
      );

      return;
    }


    setLoading(true);


    try {
      const payload = {
        ...form,

        email: form.email.trim(),

        phone: form.phone.trim(),

        emailVerificationToken
      };


      if (!payload.city) {
        delete payload.city;
      }


      // Register through existing AuthContext
      await register(payload);


      // Registration successful
      navigate('/profile/create');


    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Registration failed. Please try again.'
      );


    } finally {
      setLoading(false);
    }
  }


  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="auth-screen">

      <AuthSidePanel
        eyebrow="Join us"
        title="Where two families come together as one."
        subtitle="Create your profile in a few minutes and start connecting with genuine matches."
      />


      <div className="auth-form-side">

        <div className="auth-card auth-card-wide">

          <span className="auth-card-eyebrow">
            Get Started
          </span>


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

            {/* ======================================
                NAME + GENDER
            ====================================== */}

            <div className="form-row">

              <div className="field-group">

                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(
                    fieldErrors.name
                  )}
                  required
                />

                {fieldErrors.name && (
                  <span className="field-error">
                    {fieldErrors.name}
                  </span>
                )}

              </div>


              <div className="field-group">

                <label htmlFor="gender">
                  Gender
                </label>

                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  aria-invalid={Boolean(
                    fieldErrors.gender
                  )}
                  required
                >

                  <option value="">
                    Select
                  </option>

                  <option value="male">
                    Male
                  </option>

                  <option value="female">
                    Female
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>


                {fieldErrors.gender && (
                  <span className="field-error">
                    {fieldErrors.gender}
                  </span>
                )}

              </div>

            </div>


            {/* ======================================
                DOB + PROFILE TYPE
            ====================================== */}

            <div className="form-row">

              <div className="field-group">

                <label htmlFor="dob">
                  Date of birth
                </label>

                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  aria-invalid={Boolean(
                    fieldErrors.dob
                  )}
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
                  aria-invalid={Boolean(
                    fieldErrors.profileType
                  )}
                  required
                >

                  <option value="">
                    Select
                  </option>

                  <option value="self">
                    Myself
                  </option>

                  <option value="parent">
                    My child
                  </option>

                  <option value="sibling">
                    My sibling
                  </option>

                  <option value="relative">
                    My relative
                  </option>

                  <option value="friend">
                    My friend
                  </option>

                </select>


                {fieldErrors.profileType && (
                  <span className="field-error">
                    {fieldErrors.profileType}
                  </span>
                )}

              </div>

            </div>


            {/* ======================================
                PHONE + EMAIL
            ====================================== */}

            <div className="form-row">

              {/* PHONE */}

              <div className="field-group">

                <label htmlFor="phone">
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  aria-invalid={Boolean(
                    fieldErrors.phone
                  )}
                  required
                />


                {fieldErrors.phone && (
                  <span className="field-error">
                    {fieldErrors.phone}
                  </span>
                )}

              </div>


              {/* EMAIL */}

              <div className="field-group">

                <label htmlFor="email">
                  Email
                </label>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px'
                  }}
                >

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(
                      fieldErrors.email
                    )}
                    disabled={
                      otpStep === 'verified'
                    }
                    required
                    style={{
                      flex: 1
                    }}
                  />


                  <button
                    type="button"
                    className="btn"
                    onClick={handleSendOtp}
                    disabled={
                      otpLoading ||
                      otpStep === 'verified'
                    }
                  >

                    {otpStep === 'verified'
                      ? 'Verified ✓'
                      : otpStep === 'sent'
                      ? 'Resend'
                      : 'Send OTP'}

                  </button>

                </div>


                {fieldErrors.email && (
                  <span className="field-error">
                    {fieldErrors.email}
                  </span>
                )}


                {/* ==================================
                    OTP INPUT
                ================================== */}

                {otpStep === 'sent' && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '8px'
                    }}
                  >

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6)
                        )
                      }
                    />


                    <button
                      type="button"
                      className="btn"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading}
                    >

                      {otpLoading
                        ? 'Verifying...'
                        : 'Verify'}

                    </button>

                  </div>
                )}


                {/* ==================================
                    VERIFIED MESSAGE
                ================================== */}

                {otpStep === 'verified' && (
                  <span
                    style={{
                      color: 'green',
                      fontSize: '12px'
                    }}
                  >
                    Email address verified ✓
                  </span>
                )}


                {otpError && (
                  <span className="field-error">
                    {otpError}
                  </span>
                )}

              </div>

            </div>


            {/* ======================================
                PASSWORD + CITY
            ====================================== */}

            <div className="form-row">

              <div className="field-group">

                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  aria-invalid={Boolean(
                    fieldErrors.password
                  )}
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


            {/* ======================================
                REGISTER BUTTON
            ====================================== */}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={
                loading ||
                otpStep !== 'verified'
              }
            >

              {loading
                ? 'Creating account...'
                : 'Register'}

            </button>

          </form>


          {/* ========================================
              LOGIN LINK
          ======================================== */}

          <p className="auth-footer">

            Already have an account?{' '}

            <Link to="/login">
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}