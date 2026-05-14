import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Shell } from "@/components/analytics/Shell";
import { ChartCard } from "@/components/analytics/StatCard";
import { getVariantPerformance, getVariantShareForProduct, allProducts } from "@/lib/adminAnalyticsMockData";

export const Route = createFileRoute("/variants")({
  head: () => ({
    meta: [
      { title: "Variant Analytics — Marketplace Admin" },
      { name: "description", content: "Granular variant performance to inform restocking decisions." },
    ],
  }),
  component: VariantsPage,
});

const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function VariantsPage() {
  const productsList = useMemo(() => allProducts.filter((p) => p.status === "ACTIVE"), []);
  const [selected, setSelected] = useState(productsList[0]?.id ?? "");
  const share = useMemo(() => getVariantShareForProduct(selected), [selected]);
  const allVariants = useMemo(() => getVariantPerformance(), []);

  return (
    <Shell title="Variant Analytics" subtitle="Granular breakdown of variant performance — sizes, colors, materials">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard
            title="Variant Popularity Share"
            subtitle="Distribution of units sold across a product's variants"
            action={
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="text-xs border border-border rounded-md px-2 py-1.5 bg-card text-foreground"
              >
                {productsList.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            }
          >
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={share} dataKey="value" nameKey="name" outerRadius={120} label={(e) => `${e.name}`}>
                  {share.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <ChartCard title="Quick Stats" subtitle="Selected product summary">
          <div className="space-y-3">
            {share.slice(0, 6).map((v, i) => {
              const total = share.reduce((s, x) => s + x.value, 0);
              const pct = total > 0 ? (v.value / total) * 100 : 0;
              return (
                <div key={v.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="font-medium text-foreground">{v.name}</span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">{v.value} · {pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Variant Performance Table" subtitle={`${allVariants.length} variants — ranked by units sold`}>
        <div className="overflow-x-auto -mx-5 max-h-[600px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left font-medium py-2.5 px-5">Product</th>
                <th className="text-left font-medium py-2.5 px-3">Variant</th>
                <th className="text-right font-medium py-2.5 px-3">Units Sold</th>
                <th className="text-right font-medium py-2.5 px-3">Current Stock</th>
                <th className="text-right font-medium py-2.5 px-5">Return Rate</th>
              </tr>
            </thead>
            <tbody>
              {allVariants.slice(0, 100).map((v) => (
                <tr key={v.id} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="py-2.5 px-5 font-medium text-foreground">{v.productName}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{v.label}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{v.units}</td>
                  <td className={`py-2.5 px-3 text-right tabular-nums font-medium ${v.stock <= 0 ? "text-destructive" : v.stock < 10 ? "text-warning" : "text-foreground"}`}>
                    {v.stock}
                  </td>
                  <td className={`py-2.5 px-5 text-right tabular-nums ${v.returnRate > 0.15 ? "text-destructive" : v.returnRate > 0.07 ? "text-warning" : "text-muted-foreground"}`}>
                    {(v.returnRate * 100).toFixed(1)}%
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
