import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [showCreateAccountPanel, setShowCreateAccountPanel] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState('');
  const [createError, setCreateError] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!lockoutUntil) return;

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        setCountdown(30);
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [lockoutUntil]);

  const isLocked = useMemo(() => {
    if (!lockoutUntil) return false;
    return Date.now() < lockoutUntil;
  }, [lockoutUntil]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLocked) return;

    setError('');
    setLoading(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 900));

      if (email.trim() !== 'admin@clearvision.ai' || password.trim() !== 'clearvision2026') {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setLockoutUntil(Date.now() + 30000);
          setCountdown(30);
        }
        setError('Invalid credentials');
        return;
      }

      login('clearvision-demo-token', email.trim());
      if (rememberMe) {
        window.localStorage.setItem('clearvision-remember', 'true');
      } else {
        window.localStorage.removeItem('clearvision-remember');
      }
      navigate('/', { replace: true });
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setCreateError('');
    setAccountCreated(false);

    if (!createEmail || !createPassword || !createConfirmPassword) {
      setCreateError('Please fill in all fields.');
      return;
    }

    if (createPassword !== createConfirmPassword) {
      setCreateError('Passwords do not match.');
      return;
    }

    if (createPassword.length < 8) {
      setCreateError('Password must be at least 8 characters.');
      return;
    }

    setCreateError('');
    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));

    setAccountCreated(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white relative">
      {/* Animated video background — same as Hero */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-0 bg-black/55" />

      {/* Ambient glow orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-8%] h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">

        {/* Login card — translucent glass */}
        <div
          className="w-full max-w-md rounded-3xl border border-white/10 shadow-2xl shadow-cyan-950/40"
          style={{
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-2xl shadow-lg shadow-cyan-500/10">
                🛰️
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">ClearVision AI</h1>
              <p className="mt-1.5 text-sm text-gray-400">Official portal access</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2" htmlFor="email">Email</label>
                <input
                  id="email"
                  ref={emailRef}
                  autoComplete="email"
                  autoFocus
                  aria-label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLocked || loading}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder-gray-500 focus:border-cyan-400/60 focus:bg-white/8 disabled:opacity-50"
                  placeholder="admin@clearvision.ai"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2" htmlFor="password">Password</label>
                <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-400/60 focus-within:bg-white/8">
                  <input
                    id="password"
                    autoComplete="current-password"
                    aria-label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isLocked || loading}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder-gray-500 disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((value) => !value)}
                    className="ml-2 text-gray-400 transition hover:text-white min-w-[20px]"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
                        <path d="M9.88 5.12A10.94 10.94 0 0 1 12 5c5 0 9 5 9 7a14.4 14.4 0 0 1-2.1 3.1" />
                        <path d="M6.1 6.1A14.6 14.6 0 0 0 3 12c0 2 4 7 9 7a10.9 10.9 0 0 0 3.9-.7" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe((value) => !value)}
                    className="h-4 w-4 rounded border-white/20 bg-black/40 accent-cyan-400"
                    aria-label="Remember me"
                  />
                  <span>Remember me</span>
                </label>
                <button type="button" className="text-cyan-400 transition hover:text-cyan-300 text-sm">
                  Forgot password?
                </button>
              </div>

              {/* Error */}
              {error ? <p className="text-sm text-rose-400">{error}</p> : null}

              {/* Lockout */}
              {isLocked ? (
                <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                  Too many attempts. Please wait {countdown}s before trying again.
                </p>
              ) : null}

              {/* Buttons */}
              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loading || isLocked}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 min-h-[48px]"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
                <button
                  type="button"
                  id="create-account-btn"
                  onClick={() => setShowCreateAccountPanel(true)}
                  className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-95 sm:w-auto min-h-[48px]"
                >
                  Create account
                </button>
              </div>
            </form>
          </div>

          {/* Create Account panel — expands inside card */}
          {showCreateAccountPanel && (
            <div className="border-t border-white/10 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold">Create Account</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Set up your ClearVision portal access.</p>
                </div>
                <button
                  type="button"
                  id="close-create-account-btn"
                  onClick={() => setShowCreateAccountPanel(false)}
                  className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:border-white/20 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2" htmlFor="createEmail">Email</label>
                  <input
                    id="createEmail"
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder-gray-500 focus:border-cyan-400/60"
                    placeholder="your.email@clearvision.ai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2" htmlFor="createPassword">Password</label>
                  <input
                    id="createPassword"
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder-gray-500 focus:border-cyan-400/60"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2" htmlFor="createConfirmPassword">Confirm Password</label>
                  <input
                    id="createConfirmPassword"
                    type="password"
                    value={createConfirmPassword}
                    onChange={(e) => setCreateConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder-gray-500 focus:border-cyan-400/60"
                    placeholder="Re-enter your password"
                  />
                </div>

                {createError ? <p className="text-sm text-rose-400">{createError}</p> : null}
                {accountCreated ? (
                  <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    ✅ Account created! You can now sign in.
                  </p>
                ) : null}

                <button
                  type="button"
                  id="submit-create-account-btn"
                  onClick={handleCreateAccount}
                  disabled={loading}
                  className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 min-h-[48px]"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hint text */}
        <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-500">
          Demo credentials: admin@clearvision.ai / clearvision2026
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
