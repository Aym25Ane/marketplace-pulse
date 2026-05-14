import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, Layers, Heart, Warehouse, RotateCcw, Boxes } from "lucide-react";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/variants", label: "Variants", icon: Layers },
  { to: "/engagement", label: "Engagement", icon: Heart },
  { to: "/inventory", label: "Inventory", icon: Warehouse },
  { to: "/returns", label: "Returns", icon: RotateCcw },
] as const;

export function Sidebar() {
  const { location } = useRouterState();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center">
          <Boxes className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Marketplace</span>
          <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Admin Analytics</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-sidebar-border text-[11px] text-sidebar-foreground/50">
        Operational view · No financial data
      </div>
    </aside>
  );
}
