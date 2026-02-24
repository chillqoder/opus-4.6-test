'use client';

import { useApp } from '@/context/AppContext';
import { getFilteredItems } from '@/lib/filters';
import { downloadJson } from '@/lib/export';

export default function ActionBar() {
  const { state, dispatch } = useApp();

  const selectCurrentTab = () => {
    const filtered = getFilteredItems(state.items, state.activeTab, state.selectedIds);
    dispatch({ type: 'SELECT_BULK', ids: filtered.map(i => i.index) });
  };

  const selectAnyValid = () => {
    const ids = state.items
      .filter(i => ['all_valid', 'any_valid', 'some_broken'].includes(i.cardStatus))
      .map(i => i.index);
    dispatch({ type: 'SELECT_BULK', ids });
  };

  const selectAllValid = () => {
    const ids = state.items
      .filter(i => i.cardStatus === 'all_valid')
      .map(i => i.index);
    dispatch({ type: 'SELECT_BULK', ids });
  };

  const handleExport = () => {
    const selected = state.items.filter(i => state.selectedIds.has(i.index));
    if (selected.length === 0) return;
    downloadJson(selected);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
        <button onClick={selectCurrentTab} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Select current tab
        </button>
        <button onClick={selectAnyValid} className="px-3 py-1.5 text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors">
          Select any valid
        </button>
        <button onClick={selectAllValid} className="px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors">
          Select all valid
        </button>
        <button onClick={() => dispatch({ type: 'INVERT_SELECTION' })} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Invert
        </button>
        <button onClick={() => dispatch({ type: 'DESELECT_ALL' })} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Deselect all
        </button>
        <div className="flex-1" />
        <span className="text-sm text-gray-500">{state.selectedIds.size} selected</span>
        <button
          onClick={handleExport}
          disabled={state.selectedIds.size === 0}
          className="px-4 py-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          Download JSON
        </button>
      </div>
    </div>
  );
}
