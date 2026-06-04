/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signIn, getAuthUser, mapRole, GUEST_USER, DEMO_ADMIN } from '../../lib/auth';
import { api, setAuthToken } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // An existing admin session skips the form. Guests can still reach it here
  // (the app lands everyone in guest mode) to upgrade to an admin login.
  useEffect(() => {
    if (getAuthUser()?.role === 'admin') router.replace('/');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      // Real backend auth — returns a Bearer token + user.
      const { token, user } = await api.login(email.trim(), password);
      setAuthToken(token);
      signIn({ id: user.id, email: user.email, name: user.name, role: mapRole(user.role) });
      router.replace('/');
    } catch {
      setError('Invalid email or password.');
      setSubmitting(false);
    }
  };

  // Guests don't need credentials — enter straight into the Take Order page.
  // They have no token and use the public POST /api/guest/orders endpoint.
  const handleGuest = () => {
    setAuthToken(null);
    signIn(GUEST_USER);
    router.replace('/');
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left: brand panel (desktop only) ─────────────────── */}
      <div className="hidden lg:flex w-[45%] bg-primary text-on-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-2.5 select-none">
          <Coffee className="w-7 h-7" />
          <span className="text-lg font-bold tracking-tight">Brewmaster</span>
        </div>

        <div className="space-y-4 max-w-sm">
          <h1 className="text-4xl font-bold tracking-tight font-display leading-tight">
            Run your café, one perfect order at a time.
          </h1>
          <p className="text-sm text-on-primary-container leading-relaxed">
            Process orders, manage your menu, and watch your sales trends — all from one calm, focused admin portal.
          </p>
        </div>

        <p className="text-[11px] text-on-primary-container/70 uppercase font-bold tracking-widest">
          Admin Portal
        </p>
      </div>

      {/* ── Right: sign-in form ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Compact brand for mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 select-none">
            <div className="p-2 bg-primary rounded-xl">
              <Coffee className="w-5 h-5 text-on-primary" />
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">Brewmaster</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary tracking-tight font-display">Welcome back</h2>
            <p className="text-sm text-on-surface-variant mt-1.5">Sign in to your admin portal to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@brewmaster.com"
                  className="w-full bg-surface-container-lowest text-sm pl-10 pr-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest text-sm pl-10 pr-11 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/55 hover:text-primary cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-on-error bg-error px-3.5 py-2.5 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-on-primary hover:bg-primary-container font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-outline-variant/50" />
            <span className="text-[11px] font-semibold text-on-surface-variant/60 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-outline-variant/50" />
          </div>

          {/* Guests skip the credential step entirely */}
          <button
            type="button"
            onClick={handleGuest}
            className="w-full bg-surface-container-lowest text-primary border border-outline-variant/60 hover:bg-surface-container-low font-bold text-sm px-6 py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            Continue as Guest
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Admin demo credential — tap to fill. Remove once you have real accounts. */}
          <button
            type="button"
            onClick={() => { setEmail(DEMO_ADMIN.email); setPassword(DEMO_ADMIN.password); setError(null); }}
            className="mt-6 w-full text-left px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/40 hover:border-primary transition-all cursor-pointer"
          >
            <span className="block text-[11px] font-bold text-primary">Demo admin — tap to fill</span>
            <span className="block text-[10px] text-on-surface-variant mt-0.5">{DEMO_ADMIN.email} · {DEMO_ADMIN.password}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
