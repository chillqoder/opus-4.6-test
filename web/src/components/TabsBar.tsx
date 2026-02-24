'use client';

import { useApp } from '@/context/AppContext';
import { TabFilter } from '@/lib/types';
import { useMemo } from 'react';
import { getFilteredItems } from '@/lib/filters';

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'all_valid', label: 'All Valid' },
  { key: 'any_valid', label: 'Any Valid' },
  { key: 'some_broken', label: 'Some Broken' },
  { key: 'all_broken', label: 'All Broken' },
  { key: 'no_images', label: 'No Images' },
  { key: 'selected', label: 'Selected' },
];

export default function TabsBar() {
  const { state, dispatch } = useApp();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const tab of TABS) {
      c[tab.key] = getFilteredItems(state.items, tab.key, state.selectedIds).length;
    }
    return c;
  }, [state.items, state.selectedIds]);

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => dispatch({ type: 'SET_TAB', tab: tab.key })}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            state.activeTab === tab.key
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {tab.label}
          <span className={`ml-1.5 text-xs ${
            state.activeTab === tab.key ? 'text-teal-100' : 'text-gray-400'
          }`}>
            {counts[tab.key]}
          </span>
        </button>
      ))}
    </div>
  );
}
