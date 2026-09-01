'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 md:p-8 pt-24">
      <div className="glass-panel w-full max-w-md rounded-xl p-6 md:p-8 flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-headline-md text-headline-md text-primary">Create Account</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Join us today</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="relative w-full">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b-2 border-outline-variant focus:border-secondary pt-4 pb-1 px-2 text-on-surface font-body-md outline-none transition-colors"
              placeholder="Full Name"
            />
          </div>

          <div className="relative w-full">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-outline-variant focus:border-secondary pt-4 pb-1 px-2 text-on-surface font-body-md outline-none transition-colors"
              placeholder="Email Address"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-secondary transition-colors duration-200 disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link href="/login" className="font-label-bold text-label-bold text-secondary hover:text-primary transition-colors underline decoration-secondary/30 underline-offset-4 hover:decoration-primary">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
