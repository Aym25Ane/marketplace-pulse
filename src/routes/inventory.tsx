import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Shell } from "@/components/analytics/Shell";
import { ChartCard, SeverityBadge } from "@/components/analytics/StatCard";
import { getWarehouseDistribution, getInventoryHealth } from "@/lib/adminAnalyticsMockData";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory Health — Marketplace Admin" },
      { name: "description", content: "Prevent stockouts and manage warehouse capacity across locations." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const dist = getWarehouseDistribution();
  const health = getInventoryHealth();

  return (
    <Shell title="Inventory Health" subtitle="Operational risk dashboard — stockout prevention and warehouse capacity">
      <ChartCard title="Warehouse Distribution" subtitle="Available vs reserved stock across physical locations">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dist} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="available" stackId="a" fill="var(--color-chart-3)" name="Available" radius={[0, 0, 0, 0]} />
            <Bar dataKey="reserved" stackId="a" fill="var(--color-chart-4)" name="Reserved" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Inventory Depletion Alerts" subtitle={`${health.length} variants under 14 days of stock`}>
        <div className="overflow-x-auto -mx-5 max-h-[600px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left font-medium py-2.5 px-5">Product</th>
                <th className="text-left font-medium py-2.5 px-3">Variant</th>
                <th className="text-right font-medium py-2.5 px-3">Available</th>
                <th className="text-right font-medium py-2.5 px-3">Avg Daily Units</th>
                <th className="text-right font-medium py-2.5 px-3">Days Remaining</th>
                <th className="text-right font-medium py-2.5 px-5">Severity</th>
              </tr>
            </thead>
            <tbody>
              {health.map((h) => (
                <tr key={h.variantId} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="py-2.5 px-5 font-medium text-foreground">{h.productName}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{h.variantLabel}</td>
                  <td className={`py-2.5 px-3 text-right tabular-nums font-medium ${h.availableStock <= 0 ? "text-destructive" : ""}`}>{h.availableStock}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{h.avgDailyUnits}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-medium">{h.daysRemaining}d</td>
                  <td className="py-2.5 px-5 text-right"><SeverityBadge severity={h.severity} /></td>
                </tr>
              ))}
              {health.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No depletion risks — all variants have &gt;14 days of stock.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </Shell>
  );
}
