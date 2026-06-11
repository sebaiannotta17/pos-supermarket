import { switchCatalogProfile, getStoredProductCount } from "../store/catalogStorage";
import { useInventoryStore } from "../store/useInventoryStore";
import { useProfileStore } from "../store/useProfileStore";

export function ProfileSwitcher() {
  const profiles = useProfileStore((s) => s.profiles);
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const renameProfile = useProfileStore((s) => s.renameProfile);
  const liveCount = useInventoryStore((s) => s.products.length);

  return (
    <div className="border-t border-slate-800 px-4 py-4 space-y-3">
      <div>
        <label
          htmlFor="profile-select"
          className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
        >
          Quién está usando la app
        </label>
        <select
          id="profile-select"
          value={activeProfileId}
          onChange={(e) => switchCatalogProfile(e.target.value)}
          className="w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-600/40"
        >
          {profiles.map((p) => {
            const count =
              p.id === activeProfileId
                ? liveCount
                : getStoredProductCount(p.id);
            return (
              <option key={p.id} value={p.id}>
                {p.name} ({count} productos)
              </option>
            );
          })}
        </select>
      </div>

      <details className="group rounded-lg border border-slate-700 bg-slate-800/70 p-2.5">
        <summary className="cursor-pointer text-xs font-medium text-slate-200 select-none list-none [&::-webkit-details-marker]:hidden">
          <span className="underline decoration-slate-500 group-open:no-underline">
            Cambiar nombres mostrados
          </span>
        </summary>
        <div className="mt-2 space-y-2 border-t border-slate-700/80 pt-2">
          {profiles.map((p) => (
            <label key={p.id} className="block">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Etiqueta
              </span>
              <input
                key={`${p.id}-${p.name}`}
                type="text"
                defaultValue={p.name}
                placeholder={p.name}
                aria-label={`Nombre para ${p.id}`}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                onBlur={(e) => renameProfile(p.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
            </label>
          ))}
        </div>
      </details>

      <p className="text-[10px] leading-snug text-slate-500">
        Cada perfil guarda su catálogo por separado en este navegador. Si no ves
        tus productos, revisá que estés en el perfil correcto (Mamá / Papá).
      </p>
    </div>
  );
}
