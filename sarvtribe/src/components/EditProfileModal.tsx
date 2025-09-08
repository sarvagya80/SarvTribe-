'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { User } from '@prisma/client';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { mutate as globalMutate } from 'swr';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { update } = useSession();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  
  const profilePicRef = useRef<HTMLInputElement>(null);
  const coverPhotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setProfilePicPreview(user.image || '/default-avatar.png');
      setCoverPhotoPreview(user.coverPhoto || '/default-cover.png');
      setProfilePicFile(null);
      setCoverPhotoFile(null);
    }
  }, [user, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'profile') {
        setProfilePicFile(file);
        setProfilePicPreview(URL.createObjectURL(file));
      } else {
        setCoverPhotoFile(file);
        setCoverPhotoPreview(URL.createObjectURL(file));
      }
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'sarvtribe_preset');
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const handleSave = async () => {
    setIsLoading(true);
    let profilePicUrl = user.image;
    let coverPhotoUrl = user.coverPhoto;

    try {
      if (profilePicFile) {
        profilePicUrl = await uploadToCloudinary(profilePicFile);
      }
      if (coverPhotoFile) {
        coverPhotoUrl = await uploadToCloudinary(coverPhotoFile);
      }
      
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, location, image: profilePicUrl, coverPhoto: coverPhotoUrl }),
      });

      await update({ name, image: profilePicUrl });
      globalMutate(`/api/profile/${user.id}`);
      onClose();
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Edit Profile
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Cover Photo</label>
                    <div className="relative w-full h-32 mt-1 rounded-lg overflow-hidden group bg-gray-200 dark:bg-gray-700">
                      <Image src={coverPhotoPreview || '/default-cover.png'} fill className="object-cover" alt="Cover preview" />
                      <input type="file" accept="image/*" ref={coverPhotoRef} onChange={(e) => handleFileChange(e, 'cover')} className="hidden" />
                      <button
                        onClick={() => coverPhotoRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <CameraIcon className="w-8 h-8 text-white" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Picture</label>
                    <div className="flex justify-center mt-2">
                      <div className="relative">
                        <Image src={profilePicPreview || '/default-avatar.png'} width={96} height={96} alt="Profile preview" className="rounded-full object-cover" />
                        <input type="file" accept="image/*" ref={profilePicRef} onChange={(e) => handleFileChange(e, 'profile')} className="hidden" />
                        <button
                          type="button"
                          onClick={() => profilePicRef.current?.click()}
                          className="absolute -bottom-1 -right-1 bg-indigo-600 p-2 rounded-full text-white border-2 border-white dark:border-gray-800"
                        >
                          <CameraIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="mt-1 w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="mt-1 w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white rounded-md bg-indigo-600 disabled:bg-indigo-400 hover:bg-indigo-700"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
