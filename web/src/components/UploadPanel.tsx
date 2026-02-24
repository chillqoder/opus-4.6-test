'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useApp } from '@/context/AppContext';

export default function UploadPanel() {
  const { loadJson } = useApp();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((files: File[]) => {
    setError(null);
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        loadJson(data);
      } catch {
        setError('Invalid JSON file. Please check the format and try again.');
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  }, [loadJson]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
  });

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        {...getRootProps()}
        className={`w-full max-w-xl p-12 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-5xl mb-4">📁</div>
        <p className="text-lg font-medium text-gray-700">
          {isDragActive ? 'Drop your JSON file here...' : 'Drag & drop a JSON file here'}
        </p>
        <p className="text-sm text-gray-500 mt-2">or click to select a file</p>
        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}
      </div>
    </div>
  );
}
