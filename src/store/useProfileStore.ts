import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Profile = {
  id: string;
  name: string;
};

type ProfileState = {
  profiles: Profile[];
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
};

export const DEFAULT_PROFILES: Profile[] = [
  { id: "mama", name: "Mamá" },
  { id: "papa", name: "Papá" },
];

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: DEFAULT_PROFILES,
      activeProfileId: "mama",
      setActiveProfileId: (id) => {
        if (get().profiles.some((p) => p.id === id)) {
          set({ activeProfileId: id });
        }
      },
      renameProfile: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === id ? { ...p, name: trimmed } : p
          ),
        }));
      },
    }),
    {
      name: "catalog-profiles-v1",
      partialize: (s) => ({
        profiles: s.profiles,
        activeProfileId: s.activeProfileId,
      }),
    }
  )
);
