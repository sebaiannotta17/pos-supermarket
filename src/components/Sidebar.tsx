import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Venta", icon: "ScanIcon" },
  { to: "/productos", label: "Productos", icon: "BoxIcon" },
  { to: "/stock", label: "Stock", icon: "StackIcon" },
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
    case "ScanIcon":
      return (
        <svg {...common}>
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <path d="M7 8v8" />
          <path d="M11 8v8" />
          <path d="M15 8v8" />
          <path d="M19 8v8" />
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
    case "StackIcon":
      return (
        <svg {...common}>
          <path d="M12 2 2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
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
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M7 9v6M10 9v6M13 9v6M16 9v6" />
          </svg>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wider text-brand-200">POS</p>
          <h1 className="text-lg font-bold leading-tight">Supermercado</h1>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
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
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
        <p>POS Supermarket v1.0</p>
        <p className="mt-1">Datos persistidos en este navegador.</p>
      </div>
    </aside>
  );
}
