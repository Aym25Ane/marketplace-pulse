import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "warning" | "destructive" | "success" | "info";
}) {
  const toneClass = {
    default: "bg-accent text-accent-foreground",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/15 text-success",
    info: "bg-info/15 text-info",
  }[tone];
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${toneClass}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold text-foreground tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function ChartCard({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: "critical" | "high" | "medium" | "low" }) {
  const map = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-warning text-warning-foreground",
    medium: "bg-info/20 text-info",
    low: "bg-success/20 text-success",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${map[severity]}`}>
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const map: Record<string, string> = {
    ACTIVE: "bg-success/15 text-success",
    DRAFT: "bg-muted text-muted-foreground",
    ARCHIVED: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${map[s] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
