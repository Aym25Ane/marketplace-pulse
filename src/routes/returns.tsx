import { createFileRoute } from "@tanstack/react-router";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw, PackageX, PackageCheck, Percent } from "lucide-react";
import { Shell } from "@/components/analytics/Shell";
import { StatCard, ChartCard } from "@/components/analytics/StatCard";
import { getReturnReasons, getReturnsKPIs, getProblematicVariants } from "@/lib/adminAnalyticsMockData";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns Analytics — Marketplace Admin" },
      { name: "description", content: "Identify operational friction, quality issues, and fulfillment errors." },
    ],
  }),
  component: ReturnsPage,
});

const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function ReturnsPage() {
  const k = getReturnsKPIs();
  const reasons = getReturnReasons();
  const problems = getProblematicVariants(20);

  return (
    <Shell title="Returns Analytics" subtitle="Quality control, fulfillment friction, and reverse-logistics signals">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Returned" value={k.totalReturned} hint="Units across 30 days" icon={RotateCcw} tone="warning" />
        <StatCard label="Damaged" value={k.damaged} hint="Not restocked" icon={PackageX} tone="destructive" />
        <StatCard label="Restocked" value={k.restocked} hint="Returned to inventory" icon={PackageCheck} tone="success" />
        <StatCard label="Return Rate" value={`${(k.returnRate * 100).toFixed(1)}%`} hint="Returned ÷ sold" icon={Percent} tone="info" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard title="Return Reason Breakdown" subtitle="Categorized by damage reason">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={reasons} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {reasons.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="xl:col-span-2">
          <ChartCard title="Problematic Variants" subtitle="Variants ranked by return rate">
            <div className="overflow-x-auto -mx-5 max-h-[400px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="text-left font-medium py-2.5 px-5">Product</th>
                    <th className="text-left font-medium py-2.5 px-3">Variant</th>
                    <th className="text-right font-medium py-2.5 px-3">Sold</th>
                    <th className="text-right font-medium py-2.5 px-3">Returned</th>
                    <th className="text-right font-medium py-2.5 px-3">Rate</th>
                    <th className="text-left font-medium py-2.5 px-5">Primary Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((p) => (
                    <tr key={p.variantId} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="py-2.5 px-5 font-medium text-foreground">{p.productName}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{p.label}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{p.units}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{p.returned}</td>
                      <td className={`py-2.5 px-3 text-right tabular-nums font-semibold ${p.rate > 0.25 ? "text-destructive" : p.rate > 0.1 ? "text-warning" : "text-foreground"}`}>
                        {(p.rate * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-5 text-muted-foreground">{p.primaryReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      </div>
    </Shell>
  );
}
