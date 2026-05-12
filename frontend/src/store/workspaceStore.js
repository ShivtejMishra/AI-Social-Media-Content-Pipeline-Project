import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkspaceStore = create(
  persist(
    (set) => ({
      selectedWorkspace: null,
      workspaces: [],

      setSelectedWorkspace: (workspace) =>
        set({ selectedWorkspace: workspace }),

      setWorkspaces: (workspaces) => set({ workspaces }),

      clearWorkspace: () => set({ selectedWorkspace: null }),
    }),
    {
      name: 'socialx-workspace',
      partialize: (state) => ({ selectedWorkspace: state.selectedWorkspace }),
    }
  )
);
