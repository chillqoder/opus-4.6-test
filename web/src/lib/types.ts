export type ImageStatus = 'pending' | 'loading' | 'valid' | 'broken';

export type CardStatus = 'all_valid' | 'any_valid' | 'some_broken' | 'all_broken' | 'no_images';

export type TabFilter = 'all' | 'all_valid' | 'any_valid' | 'some_broken' | 'all_broken' | 'no_images' | 'selected';

export interface ImageCandidate {
  url: string;
  path: string;
  status: ImageStatus;
}

export interface JsonItem {
  index: number;
  title: string;
  originalData: Record<string, unknown>;
  images: ImageCandidate[];
  cardStatus: CardStatus;
}

export interface ValidationProgress {
  validated: number;
  total: number;
}

export interface AppState {
  items: JsonItem[];
  selectedIds: Set<number>;
  activeTab: TabFilter;
  validationProgress: ValidationProgress;
}
