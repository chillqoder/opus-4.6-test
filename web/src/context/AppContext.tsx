'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { AppState, JsonItem, TabFilter, ImageStatus, ValidationProgress } from '@/lib/types';
import { buildItems, computeCardStatus } from '@/lib/json-utils';
import { ValidationQueue } from '@/lib/image-validator';

type Action =
  | { type: 'SET_ITEMS'; items: JsonItem[] }
  | { type: 'TOGGLE_SELECT'; id: number }
  | { type: 'SELECT_BULK'; ids: number[] }
  | { type: 'DESELECT_ALL' }
  | { type: 'INVERT_SELECTION' }
  | { type: 'SET_TAB'; tab: TabFilter }
  | { type: 'UPDATE_IMAGE_STATUS'; itemIndex: number; url: string; status: ImageStatus }
  | { type: 'SET_VALIDATION_PROGRESS'; progress: ValidationProgress };

const initialState: AppState = {
  items: [],
  selectedIds: new Set(),
  activeTab: 'all',
  validationProgress: { validated: 0, total: 0 },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items, selectedIds: new Set(), activeTab: 'all' };

    case 'TOGGLE_SELECT': {
      const next = new Set(state.selectedIds);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { ...state, selectedIds: next };
    }

    case 'SELECT_BULK':
      return { ...state, selectedIds: new Set([...state.selectedIds, ...action.ids]) };

    case 'DESELECT_ALL':
      return { ...state, selectedIds: new Set() };

    case 'INVERT_SELECTION': {
      const all = new Set(state.items.map(i => i.index));
      state.selectedIds.forEach(id => all.delete(id));
      return { ...state, selectedIds: all };
    }

    case 'SET_TAB':
      return { ...state, activeTab: action.tab };

    case 'UPDATE_IMAGE_STATUS': {
      const items = state.items.map(item => {
        if (item.index !== action.itemIndex) return item;
        const images = item.images.map(img =>
          img.url === action.url ? { ...img, status: action.status } : img
        );
        return { ...item, images, cardStatus: computeCardStatus(images) };
      });
      return { ...state, items };
    }

    case 'SET_VALIDATION_PROGRESS':
      return { ...state, validationProgress: action.progress };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  loadJson: (data: unknown) => void;
  runValidation: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const queueRef = useRef(new ValidationQueue(8));

  const loadJson = useCallback((data: unknown) => {
    const items = buildItems(data);
    dispatch({ type: 'SET_ITEMS', items });
  }, []);

  const runValidation = useCallback(() => {
    const queue = queueRef.current;
    queue.reset();

    const allImages: Array<{ itemIndex: number; url: string }> = [];
    state.items.forEach(item => {
      item.images.forEach(img => {
        allImages.push({ itemIndex: item.index, url: img.url });
      });
    });

    const total = allImages.length;
    let validated = 0;
    dispatch({ type: 'SET_VALIDATION_PROGRESS', progress: { validated: 0, total } });

    allImages.forEach(({ itemIndex, url }) => {
      queue.validate(url).then(status => {
        dispatch({ type: 'UPDATE_IMAGE_STATUS', itemIndex, url, status });
        validated++;
        dispatch({ type: 'SET_VALIDATION_PROGRESS', progress: { validated, total } });
      });
    });
  }, [state.items]);

  return (
    <AppContext.Provider value={{ state, dispatch, loadJson, runValidation }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
