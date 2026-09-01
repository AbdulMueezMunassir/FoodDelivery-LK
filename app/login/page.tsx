'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 md:p-8 pt-24">
      <div className="glass-panel w-full max-w-md rounded-xl p-6 md:p-8 flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-headline-md text-headline-md text-primary">Welcome Back</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Please enter your details to sign in.</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="relative w-full">
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-outline-variant focus:border-secondary pt-4 pb-1 px-2 text-on-surface font-body-md outline-none transition-colors"
              placeholder="Email or Phone Number"
            />
          </div>

          <div className="relative w-full">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-outline-variant focus:border-secondary pt-4 pb-1 px-2 text-on-surface font-body-md outline-none transition-colors"
              placeholder="Password"
            />
          </div>

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="rounded border-outline text-secondary focus:ring-secondary/50 bg-transparent w-4 h-4 cursor-pointer transition-colors" />
              <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
            </label>
            <a href="#" className="font-label-bold text-label-bold text-secondary hover:text-primary transition-colors">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-tertiary text-on-tertiary font-label-bold text-label-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-grow border-t border-outline-variant"></div>
          <span className="px-2 font-body-md text-body-md text-outline">or</span>
          <div className="flex-grow border-t border-outline-variant"></div>
        </div>

        <button className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-label-bold text-label-bold py-3 px-4 rounded-full flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors duration-200">
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Don't have an account?{' '}
            <Link href="/register" className="font-label-bold text-label-bold text-secondary hover:text-primary transition-colors underline decoration-secondary/30 underline-offset-4 hover:decoration-primary">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
