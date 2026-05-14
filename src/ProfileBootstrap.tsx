import { useEffect } from "react";
import { initCatalogAfterProfilesHydrated } from "./store/catalogStorage";
import { useProfileStore } from "./store/useProfileStore";

export function ProfileBootstrap() {
  useEffect(() => {
    let alive = true;
    void Promise.resolve(useProfileStore.persist.rehydrate()).then(() => {
      if (!alive) return;
      initCatalogAfterProfilesHydrated();
    });
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
