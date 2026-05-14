import { NavLink } from "react-router-dom";
import { useInventoryStore } from "../store/useInventoryStore";

const links = [
  { to: "/", label: "Dashboard", icon: "DashIcon" },
  { to: "/movimientos", label: "Movimientos", icon: "ScanIcon" },
  { to: "/alertas", label: "Alertas", icon: "AlertIcon", showBadge: true },
  { to: "/productos", label: "Productos", icon: "BoxIcon" },
  { to: "/categorias", label: "Categorías", icon: "TagIcon" },
  { to: "/historial", label: "Historial", icon: "HistoryIcon" },
] as const;

type IconName = (typeof links)[number]["icon"];

function Icon({ name }: { name: IconName }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "DashIcon":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "ScanIcon":
      return (
        <svg {...common}>
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <path d="M7 8v8M11 8v8M15 8v8M19 8v8" />
        </svg>
      );
    case "AlertIcon":
      return (
        <svg {...common}>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "BoxIcon":
      return (
        <svg {...common}>
          <path d="M21 8 12 3 3 8v8l9 5 9-5V8z" />
          <path d="M3 8l9 5 9-5" />
          <path d="M12 13v8" />
        </svg>
      );
    case "TagIcon":
      return (
        <svg {...common}>
          <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
    case "HistoryIcon":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
  }
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const alertsCount = useInventoryStore(
    (s) =>
      s.products.filter((p) => p.stock === 0 || p.stock <= p.minStock).length
  );

  return (
    <aside className="flex h-full w-full flex-col bg-slate-900 text-slate-100 md:w-64">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 8 12 3 3 8v8l9 5 9-5V8z" />
            <path d="M3 8l9 5 9-5" />
          </svg>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wider text-brand-200">
            Stock
          </p>
          <h1 className="text-lg font-bold leading-tight">Supermercado</h1>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-600 text-white shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              ].join(" ")
            }
          >
            <Icon name={link.icon} />
            <span className="flex-1">{link.label}</span>
            {"showBadge" in link && link.showBadge && alertsCount > 0 && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                {alertsCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
        <p>Stock Manager v2</p>
        <p className="mt-1">Datos guardados en este navegador.</p>
      </div>
    </aside>
  );
}
