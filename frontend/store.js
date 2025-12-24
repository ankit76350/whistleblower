import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      currentSecretKey: null,
      setSecretKey: (key) => set({ currentSecretKey: key }),
      isAdminMode: false,
      toggleAdminMode: () => set((state) => ({ isAdminMode: !state.isAdminMode })),
    }),
    {
      name: 'whistleblower-session', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // Only use sessionStorage for security
    }
  )
);
