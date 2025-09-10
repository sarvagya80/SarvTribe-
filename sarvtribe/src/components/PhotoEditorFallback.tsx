'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/solid';

interface PhotoEditorFallbackProps {
  onSave: (file: File) => void;
  onClose: () => void;
  imageFile?: File | null;
}

export default function PhotoEditorFallback({ onSave, onClose, imageFile }: PhotoEditorFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
  });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (imageFile) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Save initial state to history
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL();
            setHistory([dataURL]);
            setHistoryIndex(0);
          }
        }
      };
      img.src = URL.createObjectURL(imageFile);
    }
  }, [imageFile]);

  useEffect(() => {
    if (image && canvasRef.current) {
      applyFilters();
    }
  }, [image, filters]);

  const applyFilters = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw original image
    ctx.drawImage(image, 0, 0);
    
    // Apply filters
    const filterString = `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturation}%) 
      blur(${filters.blur}px) 
      sepia(${filters.sepia}%) 
      grayscale(${filters.grayscale}%)
    `;
    
    ctx.filter = filterString;
    ctx.drawImage(image, 0, 0);
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataURL);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = history[newIndex];
        }
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = history[newIndex];
        }
      }
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'edited-image.png', { type: 'image/png' });
        onSave(file);
      }
    }, 'image/png');
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0,
    });
  };

  const presetFilters = [
    { name: 'Original', filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0, grayscale: 0 } },
    { name: 'Vintage', filters: { brightness: 90, contrast: 110, saturation: 80, blur: 0, sepia: 30, grayscale: 0 } },
    { name: 'Bright', filters: { brightness: 120, contrast: 110, saturation: 120, blur: 0, sepia: 0, grayscale: 0 } },
    { name: 'Moody', filters: { brightness: 80, contrast: 120, saturation: 70, blur: 0, sepia: 0, grayscale: 0 } },
    { name: 'B&W', filters: { brightness: 100, contrast: 120, saturation: 0, blur: 0, sepia: 0, grayscale: 100 } },
  ];

  if (!image) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Photo Editor</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No image selected for editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Photo Editor (Fallback)</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <ArrowUturnLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <ArrowUturnRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[70vh]">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="max-w-full max-h-full overflow-auto">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full border border-gray-300 dark:border-gray-600 rounded-lg"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
          </div>

          {/* Controls Panel */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            {/* Preset Filters */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Preset Filters</h4>
              <div className="grid grid-cols-2 gap-2">
                {presetFilters.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setFilters(preset.filters);
                      saveToHistory();
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Adjustments */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Adjustments</h4>
              
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Brightness: {filters.brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.brightness}
                  onChange={(e) => setFilters({ ...filters, brightness: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Contrast: {filters.contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.contrast}
                  onChange={(e) => setFilters({ ...filters, contrast: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Saturation: {filters.saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturation}
                  onChange={(e) => setFilters({ ...filters, saturation: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Blur: {filters.blur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.blur}
                  onChange={(e) => setFilters({ ...filters, blur: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Sepia: {filters.sepia}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.sepia}
                  onChange={(e) => setFilters({ ...filters, sepia: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Grayscale: {filters.grayscale}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.grayscale}
                  onChange={(e) => setFilters({ ...filters, grayscale: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
