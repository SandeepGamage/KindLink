import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background gradient blobs */}
      <div className="login-bg-gradient" aria-hidden="true" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon" aria-hidden="true">♥</div>
          <span className="login-logo-text">KindLink</span>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Admin Sign In</h1>
          <p>Access the KindLink administrator portal</p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error" role="alert" aria-live="assertive">
            <span aria-hidden="true">⚠</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="input-email">
              Email Address
            </label>
            <input
              id="input-email"
              type="email"
              className="form-input"
              placeholder="admin@kindlink.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="input-password">
              Password
            </label>
            <input
              id="input-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className="btn-login"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in…' : 'Sign In to Admin Portal'}
          </button>
        </form>

        {/* Footer note */}
        <p
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--color-text-muted)',
          }}
        >
          Restricted to administrators only.
          <br />
          Contact your system admin if you need access.
        </p>
      </div>
    </div>
  );
}
