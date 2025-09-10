'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    // Always show generic message, then navigate to reset form
    setMessage('If an account exists, a 6-digit code has been sent to your email.');
    setIsLoading(false);
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-[url('/login-bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="absolute w-full h-full inset-0 bg-black/50"></div>
      <div className="relative w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <p className="text-center text-sm text-gray-500">
          Enter your email and we'll send you a 6-digit code to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold disabled:bg-indigo-400"
          >
            {isLoading ? 'Sending...' : 'Send Code'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-green-500">{message}</p>}
        <p className="text-center text-sm">
          Remember your password? <Link href="/login" className="text-indigo-400 hover:underline">Log In</Link>
        </p>
      </div>
    </main>
  );
}