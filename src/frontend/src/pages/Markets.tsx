import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

const INDICES = [
  {
    name: "S&P 500",
    symbol: "SPX",
    value: 5243.88,
    change: 1.14,
    positive: true,
  },
  {
    name: "NASDAQ",
    symbol: "COMP",
    value: 16399.52,
    change: 1.42,
    positive: true,
  },
  {
    name: "Dow Jones",
    symbol: "DJI",
    value: 39069.11,
    change: 0.56,
    positive: true,
  },
  {
    name: "Russell 2000",
    symbol: "RUT",
    value: 2068.44,
    change: -0.31,
    positive: false,
  },
  { name: "VIX", symbol: "VIX", value: 14.82, change: -3.21, positive: false },
  {
    name: "10Y Treasury",
    symbol: "TNX",
    value: 4.31,
    change: 0.02,
    positive: true,
  },
];

const MOVERS = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corp",
    price: 876.35,
    change: 4.82,
    positive: true,
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc",
    price: 171.83,
    change: -2.45,
    positive: false,
  },
  {
    ticker: "AAPL",
    name: "Apple Inc",
    price: 189.12,
    change: 1.23,
    positive: true,
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    price: 418.56,
    change: 0.87,
    positive: true,
  },
  {
    ticker: "AMZN",
    name: "Amazon.com",
    price: 185.07,
    change: -0.63,
    positive: false,
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    price: 504.27,
    change: 2.11,
    positive: true,
  },
];

const CRYPTO = [
  {
    ticker: "BTC",
    name: "Bitcoin",
    price: 67243.1,
    change: 2.34,
    positive: true,
  },
  {
    ticker: "ETH",
    name: "Ethereum",
    price: 3498.77,
    change: 1.72,
    positive: true,
  },
  {
    ticker: "SOL",
    name: "Solana",
    price: 172.44,
    change: -1.18,
    positive: false,
  },
  { ticker: "BNB", name: "BNB", price: 598.31, change: 0.44, positive: true },
];

const fmt = (n: number, decimals = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

function TickerRow({
  ticker,
  name,
  price,
  change,
  positive,
  i,
}: {
  ticker: string;
  name: string;
  price: number;
  change: number;
  positive: boolean;
  i: number;
}) {
  return (
    <div
      className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
      data-ocid={`markets.ticker.item.${i + 1}`}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ background: positive ? "#2DBE7E" : "#E25555" }}
        >
          {ticker.slice(0, 2)}
        </span>
        <div>
          <p className="text-sm font-semibold">{ticker}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[130px]">
            {name}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">
          {price > 100 ? fmt(price, 0) : fmt(price)}
        </p>
        <p
          className={`text-xs font-medium flex items-center justify-end gap-0.5 ${positive ? "text-success" : "text-destructive"}`}
        >
          {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {positive ? "+" : ""}
          {change}%
        </p>
      </div>
    </div>
  );
}

export default function Markets() {
  return (
    <div className="p-6 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">Markets</h1>
          <Badge variant="secondary" className="text-xs">
            Live data coming soon
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Market overview and key indices
        </p>
      </motion.div>

      {/* Index cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {INDICES.map((idx, i) => (
          <motion.div
            key={idx.symbol}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Card
              className="shadow-card border-border"
              data-ocid={`markets.index.item.${i + 1}`}
            >
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">{idx.symbol}</p>
                <p className="text-base font-bold mt-0.5">
                  {idx.value.toLocaleString()}
                </p>
                <p
                  className={`text-xs font-medium flex items-center gap-0.5 mt-0.5 ${idx.positive ? "text-success" : "text-destructive"}`}
                >
                  {idx.positive ? (
                    <TrendingUp size={10} />
                  ) : (
                    <TrendingDown size={10} />
                  )}
                  {idx.positive ? "+" : ""}
                  {idx.change}%
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Movers */}
        <Card
          className="shadow-card border-border"
          data-ocid="markets.movers.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Movers</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {MOVERS.map((m, i) => (
              <TickerRow key={m.ticker} {...m} i={i} />
            ))}
          </CardContent>
        </Card>

        {/* Crypto */}
        <Card
          className="shadow-card border-border"
          data-ocid="markets.crypto.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Crypto</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {CRYPTO.map((c, i) => (
              <TickerRow key={c.ticker} {...c} i={i} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-1">
        <Globe size={12} /> Market data shown is for illustrative purposes only.
      </div>
    </div>
  );
}
