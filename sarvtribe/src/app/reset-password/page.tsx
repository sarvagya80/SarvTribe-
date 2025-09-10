'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const prefillEmail = searchParams.get('email');
    if (prefillEmail) setEmail(prefillEmail);
  }, [searchParams]);

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setError('');
    setMessage('');
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setMessage('If an account exists, a new code has been sent.');
    } catch (_e) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, password }),
    });

    if (res.ok) {
      setMessage('Password reset successfully! You can now log in.');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      const data = await res.text();
      setError(data || 'Failed to reset password.');
    }
    setIsLoading(false);
  };

  return (
    <div className="relative w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
      <h2 className="text-2xl font-bold text-center">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none"/>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="otp">6-Digit OTP</label>
            <button
              type="button"
              onClick={handleResend}
              disabled={!email || isResending}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
            >
              {isResending ? 'Sending…' : 'Resend code'}
            </button>
          </div>
          <input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none"/>
        </div>
        <div>
          <label htmlFor="password">New Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none"/>
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none"/>
        </div>
        <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold disabled:bg-indigo-400">
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {message && <p className="text-green-500 text-center">{message}</p>}
    </div>
  );
}

// We wrap the component in Suspense because useSearchParams must be used in a Client Component
export default function ResetPasswordPage() {
    return (
        <main className="flex items-center justify-center min-h-screen bg-[url('/login-bg.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="absolute w-full h-full inset-0 bg-black/50"></div>
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </main>
    );
}