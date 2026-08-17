import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-bg-app">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-brand-dark to-brand relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

        <div className="flex items-center gap-3 text-xl font-bold text-white z-10">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          KindLink
        </div>

        <div className="z-10 mt-20 mb-auto">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white mb-6">
            Empower kindness.<br />
            Manage seamlessly.
          </h1>
          <p className="text-lg text-white/80 max-w-md mb-12">
            The administrative portal to manage users, system notifications, and monitor platform statistics.
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 text-sm text-white/90">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-white/10">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              Manage users and their accounts efficiently
            </div>
            <div className="flex items-center gap-4 text-sm text-white/90">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-white/10">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              Broadcast and manage system notifications
            </div>
            <div className="flex items-center gap-4 text-sm text-white/90">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-white/10">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              View real-time system statistics and metrics
            </div>
          </div>
        </div>

        <div className="text-sm text-white/60 mt-auto z-10">
          Secure admin portal. Unauthorized access is strictly prohibited.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 lg:p-16 bg-bg-app relative">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h2>
            <p className="text-sm text-text-secondary">Enter your email and password to sign in.</p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-primary" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-border text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-primary" htmlFor="password">Password</label>
                </div>
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-border text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full flex items-center justify-center px-4 py-2.5 mt-8 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bg-app transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-text-muted px-8">
          This site is protected by Cloudflare Turnstile, and the Cloudflare <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a> and <a href="#" className="hover:text-text-primary transition-colors">Terms of Use</a> apply.
        </div>
      </div>
    </div>
  );
}
