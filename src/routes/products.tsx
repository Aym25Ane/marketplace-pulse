import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
} from "recharts";
import { Search, Package, ShoppingBag, TrendingUp, AlertTriangle, Heart, Layers } from "lucide-react";
import { Shell } from "@/components/analytics/Shell";
import { ChartCard, StatCard, StatusBadge, SeverityBadge } from "@/components/analytics/StatCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  categories,
  getProductKPIs,
  getTopProductsFiltered,
  getCategoryShareFiltered,
  getProductTrend,
  getProductStatusFiltered,
  getProductPerformanceFiltered,
  getLowStockProducts,
} from "@/lib/adminAnalyticsMockData";

const searchSchema = z.object({
  days: fallback(z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(365)]), 30).default(30),
  q: fallback(z.string(), "").default(""),
  cat: fallback(z.string(), "all").default("all"),
  status: fallback(z.enum(["all", "ACTIVE", "DRAFT", "ARCHIVED"]), "all").default("all"),
});

export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Product Analytics — Marketplace Admin" },
      { name: "description", content: "Search products, filter by date, and analyze catalog performance." },
    ],
  }),
  component: ProductsPage,
});

const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function ProductsPage() {
  const { days, q, cat, status } = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });

  const filters = { days, search: q, categoryId: cat, status };

  const kpis = useMemo(() => getProductKPIs(filters), [days, q, cat, status]);
  const top = useMemo(() => getTopProductsFiltered(filters, 10), [days, q, cat, status]);
  const share = useMemo(() => getCategoryShareFiltered(filters), [days, q, cat, status]);
  const trend = useMemo(() => getProductTrend(filters), [days, q, cat, status]);
  const statusDist = useMemo(() => getProductStatusFiltered(filters), [days, q, cat, status]);
  const perf = useMemo(() => getProductPerformanceFiltered(filters), [days, q, cat, status]);
  const lowStock = useMemo(() => getLowStockProducts(filters, 6), [days, q, cat, status]);

  const setSearch = (patch: Partial<{ days: number; q: string; cat: string; status: string }>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) as never });

  return (
    <Shell title="Product Analytics" subtitle="Search products, filter by date, and analyze catalog performance">
      {/* ---------- Filter bar ---------- */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setSearch({ q: e.target.value })}
            placeholder="Search products by name…"
            className="pl-9 h-9"
          />
        </div>
        <Select value={cat} onValueChange={(v) => setSearch({ cat: v })}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setSearch({ status: v })}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
        <DateRangeTabs value={days} onChange={(d) => setSearch({ days: d })} />
      </div>

      {/* ---------- KPI cards ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Products" value={kpis.productCount} hint={`${kpis.activeCount} active`} icon={Package} />
        <StatCard label="Units Sold" value={kpis.units.toLocaleString()} hint={`Last ${days} days`} icon={ShoppingBag} tone="info" />
        <StatCard label="Orders" value={kpis.orders.toLocaleString()} hint="Unique fulfilled" icon={TrendingUp} tone="success" />
        <StatCard label="Avg Units / Product" value={kpis.avgUnitsPerProduct.toFixed(1)} icon={Layers} />
        <StatCard label="Engagement" value={kpis.engagement.toLocaleString()} hint="Reactions + comments" icon={Heart} tone="info" />
        <StatCard label="Return Rate" value={`${(kpis.returnRate * 100).toFixed(1)}%`} icon={AlertTriangle} tone={kpis.returnRate > 0.1 ? "destructive" : "warning"} />
      </div>

      {/* ---------- Trend chart ---------- */}
      <ChartCard
        title="Units Sold Trend"
        subtitle={`Daily units for filtered products — last ${days} days`}
        action={<RangePill days={days} />}
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="uTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="units" stroke="var(--color-chart-1)" strokeWidth={2.5} fill="url(#uTrend)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ---------- Top + Category + Status ---------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard title="Top Products by Units Sold" subtitle={`Last ${days} days · ${top.length} shown`} action={<RangePill days={days} />}>
            {top.length === 0 ? (
              <EmptyState message="No sales match the current filters." />
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(280, top.length * 32)}>
                <BarChart data={top} layout="vertical" margin={{ top: 0, right: 16, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "var(--color-foreground)" }} width={130} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="units" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="Category Share" subtitle={`Volume share — last ${days} days`} action={<RangePill days={days} />}>
            {share.length === 0 ? (
              <EmptyState message="No data." />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={share} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {share.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Status Distribution" subtitle="Catalog state breakdown">
            <div className="space-y-2">
              {statusDist.length === 0 && <EmptyState message="No products." />}
              {statusDist.map((s) => {
                const total = statusDist.reduce((sum, x) => sum + x.value, 0);
                const pct = total > 0 ? (s.value / total) * 100 : 0;
                return (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <StatusBadge status={s.name} />
                      <span className="font-medium tabular-nums">{s.value} · {pct.toFixed(0)}%</span>
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

      {/* ---------- Low stock alerts ---------- */}
      <ChartCard
        title="Low-Stock Active Products"
        subtitle="Active products with depleted aggregate stock — restock candidates"
        action={<span className="text-[11px] text-muted-foreground">{lowStock.length} flagged</span>}
      >
        {lowStock.length === 0 ? (
          <EmptyState message="All active products have healthy stock." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {lowStock.map((p) => (
              <div key={p.id} className="border border-border rounded-lg p-3 flex items-center gap-3 hover:bg-accent/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.category} · {p.variantCount} variants</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground tabular-nums">{p.stock}</div>
                  <SeverityBadge severity={p.stock === 0 ? "critical" : p.stock < 15 ? "high" : "medium"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartCard>

      {/* ---------- Performance table ---------- */}
      <ChartCard title="Product Performance Table" subtitle={`${perf.length} products match filters`}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left font-medium py-2.5 px-5">Product</th>
                <th className="text-left font-medium py-2.5 px-3">Category</th>
                <th className="text-left font-medium py-2.5 px-3">Status</th>
                <th className="text-right font-medium py-2.5 px-3">Orders</th>
                <th className="text-right font-medium py-2.5 px-3">Units</th>
                <th className="text-right font-medium py-2.5 px-3">Stock</th>
                <th className="text-right font-medium py-2.5 px-5">Return Rate</th>
              </tr>
            </thead>
            <tbody>
              {perf.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No products match the current filters.</td></tr>
              )}
              {perf.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="py-3 px-5 font-medium text-foreground">{p.name}</td>
                  <td className="py-3 px-3 text-muted-foreground">{p.category}</td>
                  <td className="py-3 px-3"><StatusBadge status={p.status} /></td>
                  <td className="py-3 px-3 text-right tabular-nums">{p.orders}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{p.units}</td>
                  <td className={`py-3 px-3 text-right tabular-nums ${p.stock === 0 ? "text-destructive font-medium" : p.stock < 15 ? "text-warning" : "text-foreground"}`}>{p.stock}</td>
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

function DateRangeTabs({ value, onChange }: { value: number; onChange: (d: 7 | 30 | 90 | 365) => void }) {
  const opts: Array<{ d: 7 | 30 | 90 | 365; label: string }> = [
    { d: 7, label: "7d" }, { d: 30, label: "30d" }, { d: 90, label: "90d" }, { d: 365, label: "1y" },
  ];
  return (
    <div className="inline-flex bg-muted rounded-md p-0.5">
      {opts.map((o) => (
        <button
          key={o.d}
          onClick={() => onChange(o.d)}
          className={`px-3 h-8 text-xs font-medium rounded transition-colors ${
            value === o.d ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function RangePill({ days }: { days: number }) {
  return <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">Last {days}d</span>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-sm text-muted-foreground py-10 text-center">{message}</div>;
}
