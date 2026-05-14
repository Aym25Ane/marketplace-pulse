import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Package, ShoppingBag, Boxes, Layers, AlertTriangle, TrendingDown, RotateCcw, Heart, ArrowUpRight } from "lucide-react";
import { Shell } from "@/components/analytics/Shell";
import { StatCard, ChartCard, SeverityBadge } from "@/components/analytics/StatCard";
import { getOverviewKPIs, getUnitsSoldTrend, getInventoryAlerts } from "@/lib/adminAnalyticsMockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Analytics Overview — Marketplace Admin" },
      { name: "description", content: "Real-time operational health of the affiliate marketplace network." },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const k = getOverviewKPIs();
  const trend = getUnitsSoldTrend(30);
  const alerts = getInventoryAlerts(8);

  return (
    <Shell title="Analytics Overview" subtitle="Executive summary of marketplace health and urgent alerts">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Units Sold" value={k.totalUnitsSold.toLocaleString()} hint="Completed + delivered" icon={ShoppingBag} tone="info" />
        <StatCard label="Completed Orders" value={k.completedOrders.toLocaleString()} hint="Fulfilled transactions" icon={Package} />
        <StatCard label="Active Products" value={k.activeProducts} hint={`${k.activeVariants} active variants`} icon={Layers} tone="success" />
        <StatCard label="Total Engagements" value={k.totalEngagements.toLocaleString()} hint="Reactions + comments" icon={Heart} tone="info" />
        <StatCard label="Out of Stock" value={k.outOfStockProducts} hint="Products with no availability" icon={AlertTriangle} tone="destructive" />
        <StatCard label="Low-Stock Variants" value={k.lowStockVariants} hint="Available < 10 units" icon={TrendingDown} tone="warning" />
        <StatCard label="Avg Return Rate" value={`${(k.avgReturnRate * 100).toFixed(1)}%`} hint="Returned ÷ sold" icon={RotateCcw} tone="warning" />
        <StatCard label="Active Variants" value={k.activeVariants} hint="Sellable SKUs" icon={Boxes} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard title="Units Sold Trend" subtitle="Daily unit volume across all products — last 30 days">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="units" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <ChartCard
          title="Urgent Inventory Alerts"
          subtitle="Variants at risk of imminent stockout"
          action={<span className="text-[11px] text-muted-foreground">{alerts.length} alerts</span>}
        >
          <div className="space-y-2 max-h-[300px] overflow-auto pr-1">
            {alerts.map((a) => (
              <div key={a.variantId} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{a.productName}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.variantLabel} · {a.availableStock} avail · {a.avgDailyUnits}/day</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">{a.daysRemaining}d</div>
                  <SeverityBadge severity={a.severity} />
                </div>
              </div>
            ))}
            {alerts.length === 0 && <div className="text-sm text-muted-foreground p-4 text-center">No alerts</div>}
          </div>
        </ChartCard>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <ArrowUpRight className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">Operational dashboard</div>
          <p className="text-xs text-muted-foreground">All KPIs are derived from order, inventory, and engagement events. Financial metrics are intentionally excluded.</p>
        </div>
      </div>
    </Shell>
  );
}
