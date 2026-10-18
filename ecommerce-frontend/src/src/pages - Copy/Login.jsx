import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5454';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || 'Login failed. Check your email and password.');
      const token = data.token || data.jwt || data.accessToken || data.access_token;
      if (!token) throw new Error('The server did not return an authentication token. Check the login API response.');
      const sourceUser = data.user || data.customer || data;
      const userId =
        sourceUser.id ??
        sourceUser.userId ??
        data.id ??
        data.userId ??
        data.customerId ??
        null;

      if (userId == null) {
        throw new Error(
          'Login succeeded, but the response did not include a user ID. Please check the /auth/login response in the backend.'
        );
      }

      const user = {
        ...sourceUser,
        id: userId,
        fullName: sourceUser.fullName || sourceUser.name || data.fullName || data.name || '',
        email: sourceUser.email || data.email || form.email.trim(),
        role: sourceUser.role || data.role || '',
      };

      // Save the exact keys consumed by MyOrders.jsx.
      localStorage.setItem('karthikMartToken', token);
      localStorage.setItem('karthikMartUser', JSON.stringify(user));
      // Normalize common role formats returned by Spring Security.
      const normalizedRole = String(user.role || '')
        .split(',')
        .map((role) => role.trim().toUpperCase())
        .find((role) => role === 'ROLE_ADMIN' || role === 'ADMIN' || role.includes('ROLE_ADMIN')) || '';

      // Administrators go to the dashboard; customers go to the storefront.
      if (normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to Karthik Mart. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <Link className="auth-brand" to="/"><span className="brand-symbol">K</span><span>Karthik Mart<span className="brand-period">.</span></span></Link>
        <div className="auth-showcase-copy"><span className="section-eyebrow">WELCOME BACK</span><h1>Your everyday<br /><em>favorites await.</em></h1><p>Sign in to continue discovering great finds at Karthik Mart.</p></div>
        <div className="auth-showcase-note">✦ &nbsp; Everyday finds. Better prices.</div>
      </section>
      <section className="auth-form-side">
        <Link to="/" className="auth-back-link">← Back to shopping</Link>
        <div className="auth-form-wrap">
          <span className="section-eyebrow">YOUR ACCOUNT</span>
          <h2>Welcome back</h2><p className="auth-subtitle">Enter your details to sign in.</p>
          <form className="auth-form" onSubmit={submit}>
            <label>Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required /></label>
            <label>Password<span className="auth-password-field"><input type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={update} required /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></span></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <span>→</span></button>
          </form>
          <p className="auth-switch">New to Karthik Mart? <Link to="/register">Create an account</Link></p>
          <p className="auth-small-print">By signing in, you agree to our store terms and privacy policy.</p>
        </div>
      </section>
    </main>
  );
}
