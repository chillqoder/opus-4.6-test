import { format } from 'date-fns';
import { JsonItem } from './types';

export function downloadJson(items: JsonItem[], filename?: string) {
  const data = items.map(item => item.originalData);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const name = filename || `json-image-cleaner-${format(new Date(), 'yyyyMMdd')}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(items: JsonItem[]): Promise<boolean> {
  const data = items.map(item => item.originalData);
  const json = JSON.stringify(data, null, 2);
  try {
    await navigator.clipboard.writeText(json);
    return true;
  } catch {
    return false;
  }
}
