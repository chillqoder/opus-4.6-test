'use client';

import { useState, useEffect } from 'react';
import { ImageCandidate } from '@/lib/types';

interface Props {
  images: ImageCandidate[];
  startIndex: number;
  onClose: () => void;
}

export default function ImageCarousel({ images, startIndex, onClose }: Props) {
  const [current, setCurrent] = useState(Math.min(startIndex, images.length - 1));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(images.length - 1, c + 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  const img = images[current];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center gap-4 p-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-white/70 hover:text-white text-2xl">&times;</button>

        <div className="flex-1 flex items-center justify-center min-h-0">
          {img.status === 'valid' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img.url} alt="" className="max-h-[70vh] max-w-full object-contain rounded-lg" />
          ) : (
            <div className="w-64 h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
              {img.status === 'broken' ? 'Image failed to load' : 'Loading...'}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-white">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 disabled:opacity-30"
          >
            ←
          </button>
          <span className="text-sm">{current + 1} / {images.length}</span>
          <button
            onClick={() => setCurrent(c => Math.min(images.length - 1, c + 1))}
            disabled={current === images.length - 1}
            className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 disabled:opacity-30"
          >
            →
          </button>
        </div>

        <p className="text-xs text-white/60 truncate max-w-full">{img.url}</p>
      </div>
    </div>
  );
}
