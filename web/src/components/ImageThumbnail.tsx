'use client';

import { ImageStatus } from '@/lib/types';

interface Props {
  url: string;
  status: ImageStatus;
  onClick?: () => void;
}

const statusBadge: Record<ImageStatus, { icon: string; color: string }> = {
  pending: { icon: '⏳', color: 'bg-gray-200' },
  loading: { icon: '⏳', color: 'bg-yellow-200' },
  valid: { icon: '✓', color: 'bg-green-500 text-white' },
  broken: { icon: '✗', color: 'bg-red-500 text-white' },
};

export default function ImageThumbnail({ url, status, onClick }: Props) {
  const badge = statusBadge[status];

  return (
    <div
      className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 cursor-pointer flex-shrink-0 border border-gray-200"
      onClick={onClick}
    >
      {status === 'valid' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
          {status === 'broken' ? '✗' : '...'}
        </div>
      )}
      <span className={`absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${badge.color}`}>
        {badge.icon}
      </span>
    </div>
  );
}
