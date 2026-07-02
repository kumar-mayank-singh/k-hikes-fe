import { EventsUIState } from "@/types/constants";
import { create } from "zustand";


export const useEventsUIStore = create<EventsUIState>((set) => ({
  isCreateFormOpen: false,
  openCreateForm: () => set({ isCreateFormOpen: true }),
  closeCreateForm: () => set({ isCreateFormOpen: false }),
  toggleCreateForm: () =>
    set((state) => ({ isCreateFormOpen: !state.isCreateFormOpen })),
}));