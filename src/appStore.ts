import { create } from 'zustand';
import type { ChatStats } from '@peinanwang/common-ui-library';

/**
 * THE APP'S OWN STORE - and a deliberate contrast with the library's.
 *
 * This is the CONVENTIONAL Zustand pattern: `create()` called at module scope.
 * That produces ONE store shared by every component that imports this file - a
 * global singleton. For an app that is exactly right: there is one theme, one
 * list of saved snapshots, one of everything.
 *
 * The library does the opposite. ChatWidget builds a store per component
 * instance with `createStore` from `zustand/vanilla`, because two chat widgets
 * on a page must not share a message list.
 *
 *   App (here)          -> module-scope create()   -> one global store
 *   Library (ChatWidget) -> createStore() factory   -> one store per instance
 *
 * Same library, opposite patterns, and the distinction matters far more in
 * practice than which state library you picked.
 */

export type Theme = 'light' | 'dark';

interface AppState {
  theme: Theme;
  /** Snapshots the user has captured from the chat widget. */
  snapshots: Array<{ at: string; stats: ChatStats }>;

  toggleTheme: () => void;
  saveSnapshot: (stats: ChatStats) => void;
  clearSnapshots: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  theme: 'light',
  snapshots: [],

  toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

  saveSnapshot: (stats) =>
    set((s) => ({
      // Newest first, capped at 5 - this is app policy, and the library has no
      // opinion about it. It just hands over the numbers.
      snapshots: [{ at: new Date().toLocaleTimeString(), stats }, ...s.snapshots].slice(0, 5),
    })),

  clearSnapshots: () => set({ snapshots: [] }),
}));
