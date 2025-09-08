'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PhotoIcon, ArrowUpOnSquareIcon, MusicalNoteIcon, XCircleIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { mutate as globalMutate } from 'swr';
import clsx from 'clsx';
import MusicSearchModal from '@/components/MusicSearchModal';

const colorOptions = ['#FFFFFF', '#000000', '#EF4444', '#3B82F6', '#22C55E'];
const filterOptions = [
  { name: 'None', value: 'none' },
  { name: '1977', value: 'sepia(0.5) hue-rotate(-30deg) saturate(1.4)' },
  { name: 'Clarendon', value: 'contrast(1.3) saturate(1.1)' },
  { name: 'Grayscale', value: 'grayscale(1)' },
];

export default function CreateStoryPage() {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textPosition, setTextPosition] = useState('middle');
  const [filter, setFilter] = useState('none');

  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<{ title: string; audioUrl: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const router = useRouter();

  useEffect(() => {
    return () => {
      previewAudioRef.current?.pause();
      previewAudioRef.current = null;
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const maxSizeInBytes = 30 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError('File is too large. Maximum size is 30MB.');
      return;
    }
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 90) {
          setError('Video is too long. Maximum duration is 90 seconds.');
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          setMediaFile(file);
          setMediaPreview(URL.createObjectURL(file));
          setMediaType('VIDEO');
          setError(null);
        }
      };
      video.src = URL.createObjectURL(file);
    } else {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMediaType('IMAGE');
      setError(null);
    }
  };

  const handleTrackSelect = (track: { title: string; audioUrl: string }) => {
    setSelectedTrack(track);
    setIsMusicModalOpen(false);
    previewAudioRef.current?.pause();
    previewAudioRef.current = new Audio(track.audioUrl);
    previewAudioRef.current.loop = true;
    setIsPlaying(false);
  };

  const removeSelectedTrack = () => {
    previewAudioRef.current?.pause();
    previewAudioRef.current = null;
    setSelectedTrack(null);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (!previewAudioRef.current) return;
    if (isPlaying) {
      previewAudioRef.current.pause();
    } else {
      previewAudioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() && !mediaFile) return;
    setIsLoading(true);
    setError(null);
    let mediaUrl: string | null = null;
    try {
      if (mediaFile) {
        const formData = new FormData();
        formData.append('file', mediaFile);
        formData.append('upload_preset', 'sarvtribe_preset');
        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          { method: 'POST', body: formData }
        );
        if (!cloudinaryRes.ok) throw new Error('Cloudinary upload failed.');
        const cloudinaryData = await cloudinaryRes.json();
        mediaUrl = cloudinaryData.secure_url;
      }
      const storyRes = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl,
          mediaType,
          textOverlay: text,
          filter,
          textPosition,
          musicUrl: selectedTrack?.audioUrl,
        }),
      });
      if (!storyRes.ok) throw new Error('Failed to save story.');
      globalMutate('/api/stories');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MusicSearchModal isOpen={isMusicModalOpen} onClose={() => setIsMusicModalOpen(false)} onTrackSelect={handleTrackSelect} />
      <div className="container mx-auto max-w-lg mt-10 px-4">
        <h1 className="text-3xl font-bold text-white mb-6">Create a New Story</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg space-y-6">
          <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            {mediaPreview ? (
              mediaType === 'IMAGE' ? (
                <Image src={mediaPreview} alt="Story preview" fill className="object-cover" style={{ filter }} />
              ) : (
                <video src={mediaPreview} autoPlay loop muted className="w-full h-full object-cover" style={{ filter }} />
              )
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center text-gray-400 cursor-pointer">
                <PhotoIcon className="w-12 h-12" />
                <p>Add Media</p>
              </div>
            )}
            <div
              className={clsx(
                'absolute inset-0 flex p-4 pointer-events-none',
                textPosition === 'top' && 'items-start',
                textPosition === 'middle' && 'items-center',
                textPosition === 'bottom' && 'items-end'
              )}
            >
              <p
                className="text-3xl font-bold text-center break-words w-full"
                style={{ color: textColor, textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
              >
                {text}
              </p>
            </div>
          </div>

          <div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing..."
              className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none"
            />
            <div className="flex justify-between mt-2">
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTextColor(color)}
                    className="w-6 h-6 rounded-full border-2"
                    style={{ backgroundColor: color, borderColor: textColor === color ? '#F9FAFB' : 'transparent' }}
                  />
                ))}
              </div>
              <div className="flex space-x-2">
                <p className="text-sm text-gray-400 self-center">Position:</p>
                {['top', 'middle', 'bottom'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setTextPosition(pos)}
                    className={`px-2 py-0.5 text-xs rounded-md ${
                      textPosition === pos ? 'bg-indigo-600 text-white' : 'bg-gray-700'
                    }`}
                  >
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              {filterOptions.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setIsMusicModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-1 text-sm rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                <MusicalNoteIcon className="w-4 h-4" />
                <span>Add Music</span>
              </button>
              {selectedTrack && (
                <div className="flex items-center space-x-2 bg-gray-600 rounded-full pl-3 pr-1 py-0.5">
                  <p className="text-xs text-gray-300 truncate">🎵 {selectedTrack.title}</p>
                  <button type="button" onClick={togglePlayPause}>
                    {isPlaying ? <PauseIcon className="w-4 h-4 text-white" /> : <PlayIcon className="w-4 h-4 text-white" />}
                  </button>
                  <button type="button" onClick={removeSelectedTrack}>
                    <XCircleIcon className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
              <p>
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          <div className="flex justify-end items-center space-x-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (!text.trim() && !mediaFile)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold inline-flex items-center hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              <ArrowUpOnSquareIcon className="w-5 h-5 mr-2" />
              {isLoading ? 'Posting...' : 'Post Story'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
