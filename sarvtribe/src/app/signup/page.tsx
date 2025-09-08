'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, User, AtSign, Mail, Lock } from 'lucide-react'; // icons

export default function SignupPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password }),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.text();
      setError(data || 'Registration failed.');
    }
    setIsLoading(false);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Glass card */}
      <div className="relative w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
          Join SarvTribe 🚀
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Create your account and connect with your community.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <AtSign className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Mail className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
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
            {isLoading ? 'Creating Account...' : 'Sign Up'}
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
          Sign up with Google
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-500 font-semibold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}
