import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  BarChart2,
  DollarSign,
  Loader2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  Category,
  useGoals,
  useHoldings,
  useSeedData,
} from "../hooks/useQueries";

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

function generatePerformanceData(totalValue: number, range: string) {
  const points =
    range === "1D"
      ? 24
      : range === "1W"
        ? 7
        : range === "1M"
          ? 30
          : range === "6M"
            ? 26
            : range === "1Y"
              ? 52
              : 60;
  const data: { time: string; value: number }[] = [];
  let val = totalValue * 0.75;
  const now = Date.now();
  const step =
    range === "1D"
      ? 3600000
      : range === "1W"
        ? 86400000
        : range === "1M"
          ? 86400000
          : range === "6M"
            ? 604800000
            : range === "1Y"
              ? 604800000
              : 2592000000;
  for (let i = 0; i < points; i++) {
    val = val + (Math.random() - 0.44) * val * 0.03;
    const label = new Date(now - (points - i) * step);
    const fmt =
      range === "1D"
        ? label.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : range === "1W" || range === "1M"
          ? label.toLocaleDateString([], { month: "short", day: "numeric" })
          : label.toLocaleDateString([], {
              month: "short",
              year: range === "ALL" ? "2-digit" : undefined,
            });
    data.push({ time: fmt, value: Math.round(val) });
  }
  data[data.length - 1].value = Math.round(totalValue);
  return data;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

export default function Dashboard() {
  const { data: holdings = [], isLoading } = useHoldings();
  const { isLoginSuccess, isInitializing } = useInternetIdentity();
  const seedData = useSeedData();
  const [range, setRange] = useState("1M");

  const stats = useMemo(() => {
    const totalValue = holdings.reduce(
      (s, h) => s + h.currentPrice * h.quantity,
      0,
    );
    const totalCost = holdings.reduce((s, h) => s + h.avgCost * h.quantity, 0);
    const cashBalance = holdings
      .filter((h) => h.category === Category.cash)
      .reduce((s, h) => s + h.currentPrice * h.quantity, 0);
    const netWorth = totalValue;
    const gainLoss = totalValue - totalCost;
    const gainLossPct = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
    return { totalValue, cashBalance, netWorth, gainLoss, gainLossPct };
  }, [holdings]);

  const allocationData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of holdings) {
      const cat = h.category as string;
      map[cat] = (map[cat] || 0) + h.currentPrice * h.quantity;
    }
    return Object.entries(map).map(([cat, value]) => ({
      name: CATEGORY_LABELS[cat] ?? cat,
      value: Math.round(value),
      color: CATEGORY_COLORS[cat] ?? "#94A3B8",
    }));
  }, [holdings]);

  const performanceData = useMemo(
    () => generatePerformanceData(stats.totalValue || 100000, range),
    [stats.totalValue, range],
  );

  const handleSeed = async () => {
    try {
      await seedData.mutateAsync();
      toast.success("Sample data loaded!");
    } catch {
      toast.error("Failed to load sample data");
    }
  };

  if (isInitializing || isLoading) {
    return (
      <div className="p-6 space-y-6" data-ocid="dashboard.loading_state">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-72 col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const isPositive = stats.gainLoss >= 0;

  return (
    <div className="p-6 space-y-6">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Welcome Back, Sarah!
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s your portfolio overview
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {/* Total Portfolio Value */}
        <Card
          className="shadow-card border-border relative overflow-hidden"
          data-ocid="dashboard.portfolio_value.card"
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{ background: "oklch(0.52 0.19 255)" }}
          />
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-foreground">
              {fmt(stats.totalValue)}
            </div>
            <div
              className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? "text-success" : "text-destructive"}`}
            >
              {isPositive ? (
                <TrendingUp size={13} />
              ) : (
                <TrendingDown size={13} />
              )}
              {isPositive ? "+" : ""}
              {fmt(stats.gainLoss)} ({isPositive ? "+" : ""}
              {stats.gainLossPct.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>

        {/* Cash Balance */}
        <Card
          className="shadow-card border-border"
          data-ocid="dashboard.cash_balance.card"
        >
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Cash Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-foreground">
              {fmt(stats.cashBalance)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Wallet size={13} /> Available liquidity
            </div>
          </CardContent>
        </Card>

        {/* Net Worth */}
        <Card
          className="shadow-card border-border"
          data-ocid="dashboard.net_worth.card"
        >
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-foreground">
              {fmt(stats.netWorth)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <DollarSign size={13} /> Total assets value
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts row */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Performance chart */}
        <Card
          className="lg:col-span-2 shadow-card border-border"
          data-ocid="dashboard.performance.card"
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Portfolio Performance
            </CardTitle>
            <Tabs value={range} onValueChange={setRange}>
              <TabsList className="h-7">
                {["1D", "1W", "1M", "6M", "1Y", "ALL"].map((r) => (
                  <TabsTrigger
                    key={r}
                    value={r}
                    className="text-xs px-2 py-0.5 h-6"
                    data-ocid={`dashboard.range_${r.toLowerCase()}.tab`}
                  >
                    {r}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-0 px-2">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={performanceData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F6FDE" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2F6FDE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E6ECF2"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={42}
                />
                <RechartTooltip
                  contentStyle={{
                    fontSize: 12,
                    border: "1px solid #E6ECF2",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                  formatter={(v: number) => [fmt(v), "Value"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2F6FDE"
                  strokeWidth={2}
                  fill="url(#perfGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card
          className="shadow-card border-border"
          data-ocid="dashboard.allocation.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {allocationData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {allocationData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartTooltip
                      contentStyle={{
                        fontSize: 12,
                        border: "1px solid #E6ECF2",
                        borderRadius: 8,
                      }}
                      formatter={(v: number) => [fmt(v), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-1">
                  {allocationData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: d.color }}
                        />
                        <span className="text-foreground">{d.name}</span>
                      </div>
                      <span className="text-muted-foreground font-medium">
                        {stats.totalValue > 0
                          ? ((d.value / stats.totalValue) * 100).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Holdings mini table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card
          className="shadow-card border-border"
          data-ocid="dashboard.holdings.card"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">
              Current Holdings
            </CardTitle>
            <Link to="/investments">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                data-ocid="dashboard.view_all.button"
              >
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            {holdings.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 text-center"
                data-ocid="dashboard.holdings.empty_state"
              >
                <BarChart2 className="text-muted-foreground mb-3" size={36} />
                <p className="text-sm font-medium text-foreground">
                  No holdings yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Add your first investment to get started
                </p>
                <div className="flex gap-2">
                  <Link to="/investments">
                    <Button
                      size="sm"
                      style={{ background: "oklch(0.52 0.19 255)" }}
                      data-ocid="dashboard.add_first.button"
                    >
                      Add Your First Holding
                    </Button>
                  </Link>
                  {isLoginSuccess && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSeed}
                      disabled={seedData.isPending}
                      data-ocid="dashboard.seed.button"
                    >
                      {seedData.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : null}
                      Load Sample Data
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        "Asset",
                        "Ticker",
                        "Category",
                        "Value",
                        "Gain/Loss",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-medium text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.slice(0, 5).map((h, i) => {
                      const value = h.currentPrice * h.quantity;
                      const cost = h.avgCost * h.quantity;
                      const gain = value - cost;
                      const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
                      const pos = gain >= 0;
                      return (
                        <tr
                          key={String(h.id)}
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                          data-ocid={`dashboard.holdings.item.${i + 1}`}
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
                                style={{
                                  background:
                                    CATEGORY_COLORS[h.category as string] ??
                                    "#94A3B8",
                                }}
                              >
                                {h.ticker.slice(0, 2)}
                              </span>
                              <span className="font-medium truncate max-w-[120px]">
                                {h.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {h.ticker}
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge
                              variant="secondary"
                              className="text-xs capitalize"
                            >
                              {CATEGORY_LABELS[h.category as string] ??
                                h.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 font-medium">
                            {fmt(value)}
                          </td>
                          <td
                            className={`px-4 py-2.5 font-medium ${pos ? "text-success" : "text-destructive"}`}
                          >
                            {pos ? "+" : ""}
                            {fmt(gain)} ({pos ? "+" : ""}
                            {gainPct.toFixed(2)}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-2 pb-4">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
