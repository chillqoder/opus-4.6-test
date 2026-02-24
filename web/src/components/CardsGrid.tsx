'use client';

import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getFilteredItems } from '@/lib/filters';
import CardItem from './CardItem';

export default function CardsGrid() {
  const { state } = useApp();

  const filtered = useMemo(
    () => getFilteredItems(state.items, state.activeTab, state.selectedIds),
    [state.items, state.activeTab, state.selectedIds]
  );

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        No items match the current filter.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
      {filtered.map(item => (
        <CardItem key={item.index} item={item} />
      ))}
    </div>
  );
}
