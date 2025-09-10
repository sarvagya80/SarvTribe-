'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, KeyRound } from 'lucide-react';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 for credentials, 2 for OTP
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      if (!res.ok) {
        throw new Error('Invalid email or password.');
      }
      setStep(2); // Move to OTP step on success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await signIn('credentials', {
      email: email.trim(),
      password: password.trim(),
      otp: otp.trim(),
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      // Stay on step 2 if OTP is wrong, or reset to step 1
      if (result.error === 'Invalid credentials' || result.error === 'OTP has expired') {
          setStep(1); // Force user to start over if something is wrong
      }
    } else {
      router.replace('/');
    }
    setIsLoading(false);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="relative w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl">
        {step === 1 ? (
          <>
            <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">Log In</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">Enter your credentials to continue.</p>
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="relative">
                <Mail className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-3 py-3 rounded-xl border ..."/>
              </div>
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Link href="/forgot-password" className="text-xs text-indigo-400 hover:underline">Forgot Password?</Link>
                </div>
                <Lock className="absolute top-10 left-3 w-5 h-5 text-gray-400" />
                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-10 pr-3 py-3 rounded-xl border ..."/>
              </div>
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 ...">
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-center">Enter Code</h1>
            <p className="text-center text-gray-400 text-sm">A 6-digit verification code was sent to {email}.</p>
            <form onSubmit={handleVerifyOtpAndLogin} className="space-y-5">
              <div className="relative">
                <KeyRound className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                <input id="otp" type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-Digit Code" required className="w-full pl-10 pr-3 py-3 rounded-xl border ..."/>
              </div>
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 ...">
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? 'Verifying & Logging In...' : 'Log In'}
              </button>
            </form>
          </>
        )}

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-indigo-500 font-semibold hover:underline">Sign Up</Link>
        </p>
      </div>
    </main>
  );
}

// We need to wrap the component in Suspense because the inner component uses useSearchParams
export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    )
}