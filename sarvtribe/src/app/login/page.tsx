'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock } from 'lucide-react'; // nice icons

function CallbackUrlLoader({ onChange }: { onChange: (url: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onChange(searchParams.get('callbackUrl') || '/');
  }, [searchParams, onChange]);
  return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState<string>('/');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else {
      router.replace(callbackUrl);
    }
    setIsLoading(false);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Suspense fallback={null}>
        <CallbackUrlLoader onChange={setCallbackUrl} />
      </Suspense>
      {/* Glass card */}
      <div className="relative w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
          Welcome Back 👋
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Log in to <span className="font-semibold text-indigo-600">SarvTribe</span> and connect with your tribe.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-semibold transition disabled:bg-indigo-400"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}

        <div className="flex items-center gap-2">
          <span className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          <span className="text-sm text-gray-500">or</span>
          <span className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        </div>

        <button className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-indigo-500 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
