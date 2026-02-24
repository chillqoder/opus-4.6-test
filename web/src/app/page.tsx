'use client';

import { useEffect, useRef } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import UploadPanel from '@/components/UploadPanel';
import TabsBar from '@/components/TabsBar';
import MetricsPanel from '@/components/MetricsPanel';
import CardsGrid from '@/components/CardsGrid';
import ActionBar from '@/components/ActionBar';

function AppContent() {
  const { state, runValidation } = useApp();
  const prevItemCount = useRef(0);

  useEffect(() => {
    if (state.items.length > 0 && state.items.length !== prevItemCount.current) {
      prevItemCount.current = state.items.length;
      runValidation();
    }
  }, [state.items, runValidation]);

  const hasItems = state.items.length > 0;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-teal-700">JSON Image Cleaner</h1>
          {hasItems && (
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Upload new file
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!hasItems ? (
          <UploadPanel />
        ) : (
          <>
            <MetricsPanel />
            <TabsBar />
            <CardsGrid />
            <ActionBar />
          </>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
