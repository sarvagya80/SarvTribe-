// src/components/LoginForm.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react'; // Import signIn
import { useRouter } from 'next/navigation'; // Import useRouter

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false, // Set to false to handle errors here
      });

      if (res?.error) {
        setError('Invalid email or password.');
        return;
      }

      // If login is successful, redirect to the home page
      router.replace('/');

    } catch (error) {
      console.error(error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="z-10 p-8 space-y-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg w-full max-w-md">
      {/* ... (Logo and heading are the same) ... */}
       <div className="text-center">
        <h1 className="text-4xl font-bold text-white">SarvTribe</h1>
      </div>

      <h2 className="text-2xl font-semibold text-center text-white">
        Log in to your account
      </h2>

      {/* Attach the handleSubmit function to the form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 bg-white/20 border border-gray-400 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="test@test.com"
            value={email} // Controlled component
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-200">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 bg-white/20 border border-gray-400 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="test"
            value={password} // Controlled component
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Display error message if there is one */}
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <div className="text-right">
          <a href="#" className="text-sm text-indigo-300 hover:text-indigo-400">Forgot Password?</a>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Log In
        </button>
      </form>
      
      {/* ... (The rest of the component is the same) ... */}
       <div className="flex items-center">
        <div className="flex-grow border-t border-gray-400"></div>
        <span className="mx-4 text-gray-300">or</span>
        <div className="flex-grow border-t border-gray-400"></div>
      </div>
      <button
        type="button"
        className="w-full flex items-center justify-center py-2 px-4 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-md shadow-md transition-colors"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.618-3.226-11.283-7.616l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 34.426 44 29.825 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
        </svg>
        Continue with Google
      </button>
      <p className="text-center text-sm text-gray-200">
        Don't have an account?{' '}
        <Link href="/signup" className="font-semibold text-indigo-300 hover:text-indigo-400">
          Sign Up
        </Link>
      </p>
    </div>
  );
}