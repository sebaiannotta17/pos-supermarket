import { useEffect, useState } from "react";
import { isCatalogReady } from "./store/catalogStorage";
import { initCatalogAfterProfilesHydrated } from "./store/catalogStorage";
import { useProfileStore } from "./store/useProfileStore";

export function ProfileBootstrap() {
  const [ready, setReady] = useState(isCatalogReady());

  useEffect(() => {
    let alive = true;
    void Promise.resolve(useProfileStore.persist.rehydrate()).then(() => {
      if (!alive) return;
      initCatalogAfterProfilesHydrated();
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Cargando catálogo…</p>
      </div>
    );
  }

  return null;
}
