'use client';

import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { TabFilter } from '@/lib/types';

export default function MetricsPanel() {
  const { state, dispatch } = useApp();

  const metrics = useMemo(() => {
    const items = state.items;
    return {
      total: items.length,
      noImages: items.filter(i => i.cardStatus === 'no_images').length,
      anyValid: items.filter(i => ['all_valid', 'any_valid', 'some_broken'].includes(i.cardStatus)).length,
      allValid: items.filter(i => i.cardStatus === 'all_valid').length,
      anyBroken: items.filter(i => ['all_broken', 'some_broken'].includes(i.cardStatus)).length,
      selected: state.selectedIds.size,
    };
  }, [state.items, state.selectedIds]);

  const progress = state.validationProgress;
  const isValidating = progress.total > 0 && progress.validated < progress.total;

  const counters: { label: string; value: number; tab: TabFilter; color: string }[] = [
    { label: 'Total', value: metrics.total, tab: 'all', color: 'bg-gray-100 text-gray-700' },
    { label: 'No Images', value: metrics.noImages, tab: 'no_images', color: 'bg-gray-100 text-gray-600' },
    { label: 'Any Valid', value: metrics.anyValid, tab: 'any_valid', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'All Valid', value: metrics.allValid, tab: 'all_valid', color: 'bg-green-50 text-green-700' },
    { label: 'Any Broken', value: metrics.anyBroken, tab: 'all_broken', color: 'bg-red-50 text-red-700' },
    { label: 'Selected', value: metrics.selected, tab: 'selected', color: 'bg-teal-50 text-teal-700' },
  ];

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {counters.map(c => (
          <button
            key={c.label}
            onClick={() => dispatch({ type: 'SET_TAB', tab: c.tab })}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${c.color} hover:opacity-80 transition-opacity`}
          >
            {c.label}: <span className="font-bold">{c.value}</span>
          </button>
        ))}
      </div>
      {isValidating && (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.validated / progress.total) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {progress.validated} / {progress.total} images validated
          </span>
        </div>
      )}
    </div>
  );
}
