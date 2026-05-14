import { createFileRoute } from "@tanstack/react-router";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Shell } from "@/components/analytics/Shell";
import { ChartCard } from "@/components/analytics/StatCard";
import { getEngagementData } from "@/lib/adminAnalyticsMockData";

export const Route = createFileRoute("/engagement")({
  head: () => ({
    meta: [
      { title: "Engagement Analytics — Marketplace Admin" },
      { name: "description", content: "Hype vs conversion: identify products with attention but no sales." },
    ],
  }),
  component: EngagementPage,
});

function EngagementPage() {
  const data = getEngagementData();

  return (
    <Shell title="Engagement Analytics" subtitle="Hype vs conversions — find products that attract attention but fail to sell">
      <ChartCard title="Engagement vs. Orders Matrix" subtitle="Total interactions mapped against units sold. Outliers above the diagonal = hype without conversion.">
        <ResponsiveContainer width="100%" height={380}>
          <ScatterChart margin={{ top: 16, right: 16, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis type="number" dataKey="units" name="Units Sold" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}>
            </XAxis>
            <YAxis type="number" dataKey="interactions" name="Interactions" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
            <ZAxis type="number" dataKey="comments" range={[60, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded-md px-3 py-2 text-xs shadow-sm">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-muted-foreground">Units sold: {p.units}</div>
                    <div className="text-muted-foreground">Reactions: {p.reactions}</div>
                    <div className="text-muted-foreground">Comments: {p.comments}</div>
                  </div>
                );
              }}
            />
            <Scatter data={data} fill="var(--color-chart-1)" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Engagement Data Table" subtitle="Products ranked by total interactions">
        <div className="overflow-x-auto -mx-5 max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left font-medium py-2.5 px-5">Product</th>
                <th className="text-right font-medium py-2.5 px-3">Reactions</th>
                <th className="text-right font-medium py-2.5 px-3">Comments</th>
                <th className="text-right font-medium py-2.5 px-3">Total Interactions</th>
                <th className="text-right font-medium py-2.5 px-3">Units Sold</th>
                <th className="text-right font-medium py-2.5 px-5">Gap Signal</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="py-2.5 px-5 font-medium text-foreground">{d.name}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{d.reactions}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{d.comments}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-medium">{d.interactions}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{d.units}</td>
                  <td className="py-2.5 px-5 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      d.gap > 100 ? "bg-warning/20 text-warning" : d.gap > 0 ? "bg-info/15 text-info" : "bg-success/15 text-success"
                    }`}>
                      {d.gap > 100 ? "High hype, low sales" : d.gap > 0 ? "Engaged" : "Converting"}
                    </span>
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
