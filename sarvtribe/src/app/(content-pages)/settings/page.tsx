'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PhotoIcon } from '@heroicons/react/24/solid';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState(''); // New state for bio
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When session data loads, pre-fill the form with name, image, and bio
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setImagePreview(session.user.image || null);
      // Fetch the full user data to get the bio
      fetch(`/api/profile/${session.user.id}`)
        .then(res => res.json())
        .then(data => setBio(data.bio || ''));
    }
  }, [session]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    let newImageUrl = session?.user?.image || null;

    // 1. If a new image was selected, upload it
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'sarvtribe_preset');

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        newImageUrl = data.secure_url;
      } catch (error) {
        console.error("Image upload failed", error);
        setIsLoading(false);
        return;
      }
    }

    // 2. Update the user profile in our database
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, image: newImageUrl, bio }), // Add bio to the request
    });

    if (response.ok) {
      // 3. Update the client-side session
      await update({ name, image: newImageUrl });
      setSuccessMessage('Profile updated successfully!');
      setImageFile(null);
    } else {
      console.error('Failed to update profile');
    }
    setIsLoading(false);
  };

  if (status === 'loading' || !session) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl mt-10 px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Edit Profile</h1>
      <div className="bg-gray-800 p-8 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col items-center">
            {/* ... (Profile Picture Upload JSX) ... */}
          </div>

          <div>
            <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none"
            />
          </div>

          {/* ADDED: Bio Textarea */}
          <div>
            <label htmlFor="bio" className="block text-gray-300 mb-2">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell us about yourself..."
              className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end">
            {successMessage && <p className="text-green-400 mr-4">{successMessage}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}