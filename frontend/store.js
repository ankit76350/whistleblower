import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      // Secret key for reporter access
      currentSecretKey: null,
      setSecretKey: (key) => set({ currentSecretKey: key }),

      // Admin mode toggle
      isAdminMode: false,
      toggleAdminMode: () => set((state) => ({ isAdminMode: !state.isAdminMode })),
    }),
    {
      name: 'whistleblower-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);


