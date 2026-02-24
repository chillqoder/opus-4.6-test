'use client';

import { useEffect, useState } from 'react';

interface Props {
  data: Record<string, unknown>;
  title: string;
  onClose: () => void;
}

export default function JsonModal({ data, title, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-800 truncate">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap break-all">{json}</pre>
        </div>
      </div>
    </div>
  );
}
