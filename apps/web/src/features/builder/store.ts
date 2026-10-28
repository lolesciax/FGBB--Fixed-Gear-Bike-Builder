import { create } from 'zustand';
import type { Configuration, Slot } from '@tracklab/domain';
import type { SavedBuild } from '../../services/api';
type History = { slot: Slot; before: string; after: string };
type Workspace = {
  configuration: Configuration | null; token: string; slot: Slot; dirty: boolean; pending: boolean; past: History[]; future: History[];
  cameraView: 'side'|'front'|'rear'|'three-quarter'; name: string; ownerKey: string; previewGrant: string; previewExpiresAt: number; saved: SavedBuild | null; editorToken: string; zoom: number; mode: '2d' | '3d';
  init: (configuration: Configuration, token: string, ownerKey: string, saved?: SavedBuild, editorToken?: string) => void;
  accept: (configuration: Configuration, token: string, history?: History, direction?: 'undo' | 'redo') => void;
  set: (value: Partial<Workspace>) => void;
};
// The configuration and guest build are deliberately never persisted to localStorage.
export const useBuilder = create<Workspace>(set => ({
  cameraView: 'side', configuration: null, token: '', slot: 'frameset', dirty: false, pending: false, past: [], future: [], name: 'Untitled build', ownerKey: '', previewGrant: '', previewExpiresAt: 0, saved: null, editorToken: '', zoom: 1, mode: '2d',
  init: (configuration, token, ownerKey, saved, editorToken) => set({ slot:'frameset',configuration, token, ownerKey, previewGrant: '', previewExpiresAt: 0, saved: saved || null, editorToken: editorToken || '', name: saved?.name || 'Untitled build', dirty: false, past: [], future: [], mode: '2d', zoom: 1 }),
  accept: (configuration, token, history, direction) => set(state => ({ configuration, token, dirty: true,
    past: direction === 'undo' ? state.past.slice(0, -1) : direction === 'redo' ? [...state.past, state.future.at(-1)!] : history ? [...state.past, history].slice(-50) : state.past,
    future: direction === 'undo' ? [...state.future, state.past.at(-1)!] : direction === 'redo' ? state.future.slice(0, -1) : [],
  })),
  set: value => set(value),
}));
