import { JsonItem, TabFilter } from './types';

export function getFilteredItems(
  items: JsonItem[],
  tab: TabFilter,
  selectedIds: Set<number>
): JsonItem[] {
  switch (tab) {
    case 'all':
      return items;
    case 'all_valid':
      return items.filter(i => i.cardStatus === 'all_valid');
    case 'any_valid':
      return items.filter(i => i.cardStatus === 'all_valid' || i.cardStatus === 'any_valid' || i.cardStatus === 'some_broken');
    case 'some_broken':
      return items.filter(i => i.cardStatus === 'some_broken');
    case 'all_broken':
      return items.filter(i => i.cardStatus === 'all_broken');
    case 'no_images':
      return items.filter(i => i.cardStatus === 'no_images');
    case 'selected':
      return items.filter(i => selectedIds.has(i.index));
    default:
      return items;
  }
}
