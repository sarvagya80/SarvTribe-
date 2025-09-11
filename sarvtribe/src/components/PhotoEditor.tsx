'use client';

import Script from 'next/script';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import PhotoEditorFallback from './PhotoEditorFallback';

interface PhotoEditorProps {
  onSave: (file: File) => void;
  onClose: () => void;
  imageFile?: File | null;
}

export default function PhotoEditor({ onSave, onClose, imageFile }: PhotoEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const initializePixo = () => {
    setScriptLoaded(true);
    // Check if the Pixo script has loaded
    if ((window as any).Pixo) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_PIXO_API_KEY;
        if (!apiKey) {
          console.warn('PIXO_API_KEY not found, using fallback editor');
          setUseFallback(true);
          setIsLoading(false);
          return;
        }

        const editor = new (window as any).Pixo.editor({
          apikey: apiKey,
          onSave: (result: any) => {
            // Pixo returns a blob, we convert it to a File object
            const imageFile = new File([result.toBlob()], "edited-image.png", { type: 'image/png' });
            onSave(imageFile);
          },
          onClose: () => {
            onClose();
          }
        });
        
        // If we have an image file, load it into the editor
        if (imageFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            editor.edit(dataUrl); // Launch the editor with the image
          };
          reader.readAsDataURL(imageFile);
        } else {
          editor.edit(); // Launch the editor without an image
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Pixo initialization error:', err);
        setUseFallback(true);
        setIsLoading(false);
      }
    } else {
      setUseFallback(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set a timeout to show fallback if Pixo doesn't load quickly
    const timeout = setTimeout(() => {
      if (isLoading && !scriptLoaded) {
        console.warn('Pixo script taking too long to load, using fallback');
        setUseFallback(true);
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [isLoading, scriptLoaded]);

  // Use fallback editor if Pixo fails or is not available
  if (useFallback) {
    return <PhotoEditorFallback onSave={onSave} onClose={onClose} imageFile={imageFile} />;
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Photo Editor</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => setUseFallback(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors mr-2"
            >
              Use Basic Editor
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Photo Editor</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading photo editor...</p>
            <button
              onClick={() => setUseFallback(true)}
              className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm"
            >
              Use Basic Editor Instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://pixoeditor.com/editor/scripts/bridge.js"
        strategy="afterInteractive"
        onLoad={initializePixo}
        onError={() => {
          console.error('Failed to load Pixo script');
          setUseFallback(true);
          setIsLoading(false);
        }}
      />
    </>
  );
}