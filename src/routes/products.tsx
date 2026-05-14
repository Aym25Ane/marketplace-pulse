import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { Shell } from "@/components/analytics/Shell";
import { ChartCard, StatusBadge } from "@/components/analytics/StatCard";
import { getTopProducts, getCategoryShare, getProductPerformance, getProductStatusDistribution } from "@/lib/adminAnalyticsMockData";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Product Performance — Marketplace Admin" },
      { name: "description", content: "Identify fast-moving products and slow-moving inventory." },
    ],
  }),
  component: ProductsPage,
});

const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function ProductsPage() {
  const top = getTopProducts(10);
  const share = getCategoryShare();
  const perf = getProductPerformance();
  const status = getProductStatusDistribution();

  return (
    <Shell title="Product Performance" subtitle="Evaluate which products are moving and which are stagnating">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard title="Top Products by Units Sold" subtitle="Ranking by total fulfilled volume">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={top} layout="vertical" margin={{ top: 0, right: 16, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "var(--color-foreground)" }} width={130} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="units" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="space-y-6">
          <ChartCard title="Category Share" subtitle="Volume share by category">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={share} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {share.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Status Distribution" subtitle="Catalog state breakdown">
            <div className="space-y-2">
              {status.map((s) => {
                const total = status.reduce((sum, x) => sum + x.value, 0);
                const pct = (s.value / total) * 100;
                return (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <StatusBadge status={s.name} />
                      <span className="font-medium">{s.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="Product Performance Table" subtitle={`${perf.length} products`}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left font-medium py-2.5 px-5">Product</th>
                <th className="text-left font-medium py-2.5 px-3">Category</th>
                <th className="text-left font-medium py-2.5 px-3">Status</th>
                <th className="text-right font-medium py-2.5 px-3">Units Sold</th>
                <th className="text-right font-medium py-2.5 px-5">Return Rate</th>
              </tr>
            </thead>
            <tbody>
              {perf.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="py-3 px-5 font-medium text-foreground">{p.name}</td>
                  <td className="py-3 px-3 text-muted-foreground">{p.category}</td>
                  <td className="py-3 px-3"><StatusBadge status={p.status} /></td>
                  <td className="py-3 px-3 text-right tabular-nums">{p.units}</td>
                  <td className={`py-3 px-5 text-right tabular-nums font-medium ${p.returnRate > 0.1 ? "text-destructive" : p.returnRate > 0.05 ? "text-warning" : "text-foreground"}`}>
                    {(p.returnRate * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </Shell>
  );
}
