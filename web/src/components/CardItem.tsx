'use client';

import { useState } from 'react';
import { JsonItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import ImageThumbnail from './ImageThumbnail';
import JsonModal from './JsonModal';
import ImageCarousel from './ImageCarousel';

interface Props {
  item: JsonItem;
}

const statusLabel: Record<string, { text: string; color: string }> = {
  all_valid: { text: 'All Valid', color: 'bg-green-100 text-green-700' },
  any_valid: { text: 'Some Valid', color: 'bg-emerald-100 text-emerald-700' },
  some_broken: { text: 'Some Broken', color: 'bg-yellow-100 text-yellow-700' },
  all_broken: { text: 'All Broken', color: 'bg-red-100 text-red-700' },
  no_images: { text: 'No Images', color: 'bg-gray-100 text-gray-500' },
};

export default function CardItem({ item }: Props) {
  const { state, dispatch } = useApp();
  const [showJson, setShowJson] = useState(false);
  const [carouselStart, setCarouselStart] = useState<number | null>(null);
  const isSelected = state.selectedIds.has(item.index);
  const label = statusLabel[item.cardStatus];

  const jsonPreview = JSON.stringify(item.originalData, null, 2);
  const previewLines = jsonPreview.split('\n').slice(0, 4).join('\n');

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border h-[280px] flex flex-col overflow-hidden transition-colors ${
        isSelected ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => dispatch({ type: 'TOGGLE_SELECT', id: item.index })}
              className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-gray-800 truncate">{item.title}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${label.color}`}>
            {label.text}
          </span>
        </div>

        {/* Images */}
        {item.images.length > 0 && (
          <div className="flex gap-1.5 px-3 py-2 overflow-x-auto flex-shrink-0">
            {item.images.slice(0, 4).map((img, i) => (
              <ImageThumbnail
                key={img.url}
                url={img.url}
                status={img.status}
                onClick={() => setCarouselStart(i)}
              />
            ))}
            {item.images.length > 4 && (
              <div
                className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-200 flex-shrink-0"
                onClick={() => setCarouselStart(4)}
              >
                +{item.images.length - 4}
              </div>
            )}
          </div>
        )}

        {/* JSON Preview */}
        <div className="flex-1 px-3 py-1 overflow-hidden min-h-0">
          <pre className="text-[11px] text-gray-500 font-mono leading-tight line-clamp-4 whitespace-pre-wrap break-all">
            {previewLines}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={() => setShowJson(true)}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            View Full JSON
          </button>
        </div>
      </div>

      {showJson && (
        <JsonModal data={item.originalData} title={item.title} onClose={() => setShowJson(false)} />
      )}
      {carouselStart !== null && (
        <ImageCarousel
          images={item.images}
          startIndex={carouselStart}
          onClose={() => setCarouselStart(null)}
        />
      )}
    </>
  );
}
