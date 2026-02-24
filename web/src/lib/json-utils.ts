import { ImageCandidate, JsonItem, CardStatus } from './types';

export function findAllStrings(obj: unknown, path = ''): Array<{ value: string; path: string }> {
  const results: Array<{ value: string; path: string }> = [];

  if (typeof obj === 'string') {
    results.push({ value: obj, path });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      results.push(...findAllStrings(item, `${path}[${i}]`));
    });
  } else if (obj !== null && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      results.push(...findAllStrings(value, path ? `${path}.${key}` : key));
    }
  }

  return results;
}

export function isLikelyImageUrl(url: string): boolean {
  const hasHttp = /^https?:\/\//i.test(url);
  if (!hasHttp) return false;
  const hasImageExt = /\.(jpe?g|png|gif|webp|avif|bmp)(\?.*)?$/i.test(url);
  return hasImageExt || url.length < 200;
}

export function extractImageCandidates(obj: Record<string, unknown>): ImageCandidate[] {
  const strings = findAllStrings(obj);
  const seen = new Set<string>();
  const candidates: ImageCandidate[] = [];

  for (const { value, path } of strings) {
    if (isLikelyImageUrl(value) && !seen.has(value)) {
      seen.add(value);
      candidates.push({ url: value, path, status: 'pending' });
    }
  }

  return candidates;
}

function getItemTitle(obj: Record<string, unknown>, index: number): string {
  for (const key of ['title', 'name', 'id']) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return String(obj[key]);
    }
  }
  return `#${index + 1}`;
}

export function computeCardStatus(images: ImageCandidate[]): CardStatus {
  if (images.length === 0) return 'no_images';
  const validCount = images.filter(i => i.status === 'valid').length;
  const brokenCount = images.filter(i => i.status === 'broken').length;
  if (validCount === images.length) return 'all_valid';
  if (brokenCount === images.length) return 'all_broken';
  if (validCount > 0 && brokenCount > 0) return 'some_broken';
  if (validCount > 0) return 'any_valid';
  if (brokenCount > 0) return 'all_broken';
  return 'any_valid'; // still loading
}

export function resolveJsonArray(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter((item): item is Record<string, unknown> =>
      item !== null && typeof item === 'object' && !Array.isArray(item)
    );
  }

  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    // Find first array property
    for (const value of Object.values(data as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        return resolveJsonArray(value);
      }
    }
  }

  return [];
}

export function buildItems(data: unknown): JsonItem[] {
  const arr = resolveJsonArray(data);
  return arr.map((obj, index) => ({
    index,
    title: getItemTitle(obj, index),
    originalData: obj,
    images: extractImageCandidates(obj),
    cardStatus: computeCardStatus(extractImageCandidates(obj)),
  }));
}
