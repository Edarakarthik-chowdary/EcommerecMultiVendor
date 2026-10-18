import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5454';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }

  async function submit(event) {
    event.preventDefault();
    setError(''); setSuccess('');
    if (form.password.length < 8) { setError('Password must contain at least 8 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: form.fullName.trim(), email: form.email.trim(), mobile: form.mobile.trim(), password: form.password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || 'Registration failed. Please check your details.');
      setSuccess(data.message || 'Your account was created successfully. Redirecting to login…');
      window.setTimeout(() => navigate('/login', { replace: true, state: { email: form.email.trim() } }), 1000);
    } catch (err) {
      setError(err.message || 'Unable to connect to Karthik Mart. Make sure the backend is running.');
    } finally { setLoading(false); }
  }

  return (
    <main className="auth-page auth-register-page">
      <section className="auth-showcase">
        <Link className="auth-brand" to="/"><span className="brand-symbol">K</span><span>Karthik Mart<span className="brand-period">.</span></span></Link>
        <div className="auth-showcase-copy"><span className="section-eyebrow">JOIN THE MARKETPLACE</span><h1>Good finds.<br /><em>Great beginnings.</em></h1><p>Create your account and make everyday shopping a little more delightful.</p></div>
        <div className="auth-showcase-note">✦ &nbsp; Your next favorite is waiting.</div>
      </section>
      <section className="auth-form-side">
        <Link to="/" className="auth-back-link">← Back to shopping</Link>
        <div className="auth-form-wrap">
          <span className="section-eyebrow">GET STARTED</span>
          <h2>Create account</h2><p className="auth-subtitle">Enter your details to join Karthik Mart.</p>
          <form className="auth-form" onSubmit={submit}>
            <label>Full name<input name="fullName" autoComplete="name" placeholder="Your full name" value={form.fullName} onChange={update} required /></label>
            <label>Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required /></label>
            <label>Mobile number<input type="tel" name="mobile" autoComplete="tel" inputMode="tel" pattern="[0-9+() -]{7,20}" placeholder="Your mobile number" value={form.mobile} onChange={update} required /></label>
            <label>Password<span className="auth-password-field"><input type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password" minLength="8" placeholder="At least 8 characters" value={form.password} onChange={update} required /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></span></label>
            <label>Confirm password<input type={showPassword ? 'text' : 'password'} name="confirmPassword" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={update} required /></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            {success && <p className="auth-success" role="status">{success}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'} <span>→</span></button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          <p className="auth-small-print">Your password is securely handled by the Karthik Mart backend.</p>
        </div>
      </section>
    </main>
  );
}
