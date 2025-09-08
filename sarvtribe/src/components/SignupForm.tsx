// src/components/SignupForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('All fields are necessary.');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.message || 'User registration failed.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md bg-black text-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-800">
      {/* Brand header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">SarvTribe</h1>
        <p className="text-sm text-gray-400 mt-1">Join the tribe today</p>
      </div>

      <h2 className="text-xl font-semibold text-center">Create an account</h2>

      {/* Signup form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 placeholder-gray-500 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
        </div>
        <div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 placeholder-gray-500 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
        </div>
        <div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 placeholder-gray-500 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 font-semibold shadow-md hover:opacity-90 transition"
        >
          Sign Up
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-pink-400 hover:text-pink-300 transition"
        >
          Log In
        </Link>
      </p>
    </div>
  );
}
