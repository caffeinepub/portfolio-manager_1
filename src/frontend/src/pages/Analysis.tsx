import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Category, useHoldings } from "../hooks/useQueries";

const CATEGORY_COLORS: Record<string, string> = {
  [Category.stock]: "#2F6FDE",
  [Category.crypto]: "#8B5CF6",
  [Category.etf]: "#2DBE7E",
  [Category.cash]: "#F59E0B",
};
const CATEGORY_LABELS: Record<string, string> = {
  [Category.stock]: "Stocks",
  [Category.crypto]: "Crypto",
  [Category.etf]: "ETFs",
  [Category.cash]: "Cash",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);

export default function Analysis() {
  const { data: holdings = [], isLoading } = useHoldings();

  const byCategory = useMemo(() => {
    const map: Record<string, { value: number; cost: number; count: number }> =
      {};
    for (const h of holdings) {
      const cat = h.category as string;
      if (!map[cat]) map[cat] = { value: 0, cost: 0, count: 0 };
      map[cat].value += h.currentPrice * h.quantity;
      map[cat].cost += h.avgCost * h.quantity;
      map[cat].count += 1;
    }
    return Object.entries(map).map(([cat, d]) => ({
      name: CATEGORY_LABELS[cat] ?? cat,
      value: Math.round(d.value),
      cost: Math.round(d.cost),
      gain: Math.round(d.value - d.cost),
      count: d.count,
      color: CATEGORY_COLORS[cat] ?? "#94A3B8",
    }));
  }, [holdings]);

  const totalValue = useMemo(
    () => holdings.reduce((s, h) => s + h.currentPrice * h.quantity, 0),
    [holdings],
  );

  const topHoldings = useMemo(
    () =>
      [...holdings]
        .sort(
          (a, b) => b.currentPrice * b.quantity - a.currentPrice * a.quantity,
        )
        .slice(0, 8)
        .map((h) => ({
          name: h.ticker,
          value: Math.round(h.currentPrice * h.quantity),
          color: CATEGORY_COLORS[h.category as string] ?? "#94A3B8",
        })),
    [holdings],
  );

  const radarData = byCategory.map((d) => ({
    category: d.name,
    allocation: totalValue > 0 ? +((d.value / totalValue) * 100).toFixed(1) : 0,
    performance: d.cost > 0 ? +((d.gain / d.cost) * 100).toFixed(1) : 0,
  }));

  if (isLoading) {
    return (
      <div
        className="p-6 grid grid-cols-2 gap-4"
        data-ocid="analysis.loading_state"
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-bold text-foreground">Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Portfolio breakdown and performance insights
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category breakdown bar */}
        <Card
          className="shadow-card border-border"
          data-ocid="analysis.category_breakdown.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Value by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={byCategory}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E6ECF2"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={40}
                />
                <RechartTooltip
                  contentStyle={{
                    fontSize: 12,
                    border: "1px solid #E6ECF2",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => [fmt(v), "Value"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {byCategory.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top holdings donut */}
        <Card
          className="shadow-card border-border"
          data-ocid="analysis.top_holdings.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Top Holdings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={topHoldings}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {topHoldings.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <RechartTooltip
                  contentStyle={{
                    fontSize: 12,
                    border: "1px solid #E6ECF2",
                    borderRadius: 8,
                  }}
                  formatter={(v: number, _: string) => [fmt(v), ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {topHoldings.slice(0, 6).map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="truncate text-foreground">{d.name}</span>
                  <span className="ml-auto text-muted-foreground">
                    {totalValue > 0
                      ? ((d.value / totalValue) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gain/Loss by category */}
        <Card
          className="shadow-card border-border"
          data-ocid="analysis.gain_loss.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Gain / Loss by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={byCategory}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E6ECF2"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={40}
                />
                <RechartTooltip
                  contentStyle={{
                    fontSize: 12,
                    border: "1px solid #E6ECF2",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => [fmt(v), "Gain/Loss"]}
                />
                <Bar dataKey="gain" radius={[4, 4, 0, 0]}>
                  {byCategory.map((d) => (
                    <Cell
                      key={d.name}
                      fill={d.gain >= 0 ? "#2DBE7E" : "#E25555"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar */}
        <Card
          className="shadow-card border-border"
          data-ocid="analysis.radar.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Allocation vs Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {radarData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E6ECF2" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                  />
                  <Radar
                    name="Allocation"
                    dataKey="allocation"
                    stroke="#2F6FDE"
                    fill="#2F6FDE"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Performance"
                    dataKey="performance"
                    stroke="#2DBE7E"
                    fill="#2DBE7E"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <RechartTooltip
                    contentStyle={{
                      fontSize: 12,
                      border: "1px solid #E6ECF2",
                      borderRadius: 8,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
