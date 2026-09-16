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

  // ... baaki poora JSX waisa hi rehne do