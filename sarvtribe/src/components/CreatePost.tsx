'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  PhotoIcon, 
  FaceSmileIcon, 
  MagnifyingGlassIcon, 
  MusicalNoteIcon, 
  XCircleIcon, 
  PlayIcon, 
  PauseIcon,
  AdjustmentsHorizontalIcon,
  VideoCameraIcon
} from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PhotoEditor from './PhotoEditor';
import Picker, { Theme } from 'emoji-picker-react';
import ImageSearchModal from './ImageSearchModal';
import MusicSearchModal from './MusicSearchModal';
import clsx from 'clsx';

const filterOptions = [
  { name: 'None', value: 'none' },
  { name: '1977', value: 'sepia(0.5) hue-rotate(-30deg) saturate(1.4)' },
  { name: 'Clarendon', value: 'contrast(1.3) saturate(1.1)' },
  { name: 'Grayscale', value: 'grayscale(1)' },
];

export default function CreatePost() {
  const { data: session } = useSession();
  const router = useRouter();
  const [postBody, setPostBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<{ title: string, audioUrl: string } | null>(null);
  const [filter, setFilter] = useState('none');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      previewAudioRef.current?.pause();
    };
  }, []);

  const handleImageEdited = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setIsEditorOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Clear video if image is selected
      setVideoFile(null);
      setVideoPreview(null);
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check video duration (2 minutes = 120 seconds)
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 120) {
          alert('Video is too long. Maximum duration is 2 minutes.');
          if (videoInputRef.current) videoInputRef.current.value = '';
        } else {
          setVideoFile(file);
          setVideoPreview(URL.createObjectURL(file));
          // Clear image if video is selected
          setImageFile(null);
          setImagePreview(null);
        }
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleImageSelectFromSearch = (imageUrl: string) => {
    setImageFile(null);
    setImagePreview(imageUrl);
    setIsSearchModalOpen(false);
  };

  const onEmojiClick = (emojiObject: { emoji: string; }) => {
    setPostBody(prevInput => prevInput + emojiObject.emoji);
  };

  const handleTrackSelect = (track: { title: string, audioUrl: string }) => {
    setSelectedTrack(track);
    setIsMusicModalOpen(false);
    if (previewAudioRef.current) previewAudioRef.current.pause();
    previewAudioRef.current = new Audio(track.audioUrl);
    previewAudioRef.current.loop = true;
    setIsPreviewPlaying(false);
  };

  const removeSelectedTrack = () => {
    previewAudioRef.current?.pause();
    previewAudioRef.current = null;
    setSelectedTrack(null);
    setIsPreviewPlaying(false);
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
    } else {
      previewAudioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPreviewPlaying(!isPreviewPlaying);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!postBody.trim() && !imagePreview && !videoPreview) return;
    previewAudioRef.current?.pause();
    setIsLoading(true);
    let imageUrl = '';
    let videoUrl = '';
    
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'sarvtribe_preset');
      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST', body: formData,
      });
      const data = await response.json();
      imageUrl = data.secure_url;
    } else if (imagePreview) {
      imageUrl = imagePreview;
    }

    if (videoFile) {
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('upload_preset', 'sarvtribe_preset');
      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`, {
        method: 'POST', body: formData,
      });
      const data = await response.json();
      videoUrl = data.secure_url;
    }

    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        postBody, 
        imageUrl,
        videoUrl,
        filter,
        musicUrl: selectedTrack?.audioUrl,
      }),
    });

    setPostBody('');
    setImageFile(null);
    setImagePreview(null);
    setVideoFile(null);
    setVideoPreview(null);
    setSelectedTrack(null);
    setFilter('none');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
    setIsLoading(false);
    router.refresh();
  };

  return (
    <>
      {/* Modals / Editors (unchanged) */}
      {isEditorOpen && (
        <PhotoEditor 
          onSave={handleImageEdited}
          onClose={() => setIsEditorOpen(false)}
          imageFile={imageFile}
        />
      )}
      <ImageSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} onImageSelect={handleImageSelectFromSearch} />
      <MusicSearchModal isOpen={isMusicModalOpen} onClose={() => setIsMusicModalOpen(false)} onTrackSelect={handleTrackSelect} />

      {/* Card */}
      <div className="relative mb-6">
        {/* top gradient accent */}
        <div className="absolute -top-2 left-6 right-6 h-1 rounded-t-lg bg-gradient-to-r from-pink-500 via-indigo-500 to-green-400 shadow-sm z-10" />

        <div className="relative p-4 bg-white/8 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Image
                src={session?.user?.image || '/default-avatar.jpeg'}
                alt="Your avatar"
                width={48}
                height={48}
                className="rounded-full object-cover shadow-md"
                key={session?.user?.image}
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1">
              <textarea
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-300 resize-none focus:outline-none text-sm rounded-lg p-3 min-h-[72px]"
                rows={3}
                placeholder="What's on your mind?"
                disabled={isLoading}
              />

              {/* Media preview (image or video) */}
              {imagePreview && (
                <div className="mt-3 relative w-full rounded-lg overflow-hidden border border-white/10 bg-black/30">
                  <div className="relative w-full h-48 sm:h-56">
                    <Image src={imagePreview} alt="Image preview" fill className="object-cover" style={{ filter }} />
                  </div>

                  {/* small overlay controls */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      title="Edit image"
                      onClick={() => setIsEditorOpen(true)}
                      className="bg-black/40 text-white p-2 rounded-full hover:bg-black/50 transition"
                    >
                      <AdjustmentsHorizontalIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Remove image"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="bg-black/40 text-white p-2 rounded-full hover:bg-black/50 transition"
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {videoPreview && (
                <div className="mt-3 relative w-full rounded-lg overflow-hidden border border-white/10 bg-black/30">
                  <div className="relative w-full h-48 sm:h-56">
                    <video 
                      src={videoPreview} 
                      controls 
                      className="w-full h-full object-cover" 
                      style={{ filter }}
                    />
                  </div>

                  {/* small overlay controls */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      title="Remove video"
                      onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                      className="bg-black/40 text-white p-2 rounded-full hover:bg-black/50 transition"
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Filter options */}
              {(imagePreview || videoPreview) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {filterOptions.map(f => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => setFilter(f.value)}
                      className={clsx(
                        "px-3 py-1 text-xs rounded-full transition",
                        filter === f.value
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-white/6 text-white/90 hover:bg-white/10"
                      )}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected music preview */}
              {selectedTrack && (
                <div className="flex items-center gap-3 mt-3 bg-white/5 rounded-full py-1 px-3 w-fit">
                  <div className="text-xs text-white/90 truncate max-w-[180px]">🎵 {selectedTrack.title}</div>
                  <button type="button" onClick={togglePreviewPlay} className="p-1 rounded-full bg-white/6 hover:bg-white/10">
                    {isPreviewPlaying ? <PauseIcon className="w-4 h-4 text-white" /> : <PlayIcon className="w-4 h-4 text-white" />}
                  </button>
                  <button type="button" onClick={removeSelectedTrack} className="p-1 rounded-full bg-white/6 hover:bg-white/10">
                    <XCircleIcon className="w-4 h-4 text-white/80" />
                  </button>
                </div>
              )}

              {/* bottom toolbar */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {/* hidden file inputs */}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />

                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full bg-white/6 hover:bg-white/10 transition" title="Add photo">
                    <PhotoIcon className="w-5 h-5 text-white/90" />
                  </button>

                  <button type="button" onClick={() => videoInputRef.current?.click()} className="p-2 rounded-full bg-white/6 hover:bg-white/10 transition" title="Add video">
                    <VideoCameraIcon className="w-5 h-5 text-white/90" />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setIsEditorOpen(true)} 
                    disabled={!imageFile}
                    className="p-2 rounded-full bg-white/6 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                    title={imageFile ? "Edit image" : "No image to edit"}
                  >
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-white/90" />
                  </button>

                  <button type="button" onClick={() => setIsSearchModalOpen(true)} className="p-2 rounded-full bg-white/6 hover:bg-white/10 transition" title="Search images">
                    <MagnifyingGlassIcon className="w-5 h-5 text-white/90" />
                  </button>

                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 rounded-full bg-white/6 hover:bg-white/10 transition" title="Emoji">
                    <FaceSmileIcon className="w-5 h-5 text-white/90" />
                  </button>

                  <button type="button" onClick={() => setIsMusicModalOpen(true)} className="p-2 rounded-full bg-white/6 hover:bg-white/10 transition" title="Add music">
                    <MusicalNoteIcon className="w-5 h-5 text-white/90" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    form={undefined}
                    onClick={(e: any) => { /* form submit handled by onSubmit */ }}
                    className="ml-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60"
                    disabled={isLoading || (!postBody.trim() && !imagePreview && !videoPreview)}
                  >
                    {isLoading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute top-full right-6 mt-2 z-50">
              <div className="relative">
                <button
                  type="button"
                  aria-label="Close emoji picker"
                  onClick={() => setShowEmojiPicker(false)}
                  className="absolute -top-2 -right-2 z-50 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
                <Picker onEmojiClick={(e) => { onEmojiClick(e); setShowEmojiPicker(false); }} theme={Theme.DARK} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
