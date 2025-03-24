import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface TrendingToken {
  token: {
    name: string;
    symbol: string;
    image: string;
  };
  events: {
    "1h": {
      priceChangePercentage: number;
    };
    "24h": {
      priceChangePercentage: number;
    };
  };
  pools: Array<{
    price: {
      usd: number;
    };
  }>;
}

export function TrendingTokenTicker() {
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        const response = await fetch("https://data.solanatracker.io/tokens/trending", {
          headers: {
            "x-api-key": import.meta.env.VITE_SOLANA_TRACKER_API_KEY || ""
          }
        });
        const data = await response.json();
        setTrendingTokens(data.slice(0, 10)); // Get top 10 trending tokens
      } catch (error) {
        console.error("Error fetching trending tokens:", error);
      }
    };

    fetchTrendingTokens();
    const interval = setInterval(fetchTrendingTokens, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (trendingTokens.length || 1));
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(timer);
  }, [trendingTokens.length]);

  if (!trendingTokens.length) return null;

  const token = trendingTokens[currentIndex];
  const price = token.pools[0]?.price.usd || 0;
  const hourChange = token.events["1h"]?.priceChangePercentage || 0;
  const dayChange = token.events["24h"]?.priceChangePercentage || 0;

  return (
    <Card className="flex items-center justify-between p-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-4">
      <div className="flex items-center gap-2">
        <img 
          src={token.token.image} 
          alt={token.token.name} 
          className="w-6 h-6 rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-semibold">{token.token.symbol}</span>
          <span className="text-xs text-muted-foreground">{token.token.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono">${price.toFixed(6)}</span>
        <div className="flex gap-2">
          <span className={`flex items-center text-sm ${hourChange >= 0 ? "text-green-500" : "text-red-500"}`}>
            {hourChange >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(hourChange).toFixed(2)}% 1h
          </span>
          <span className={`flex items-center text-sm ${dayChange >= 0 ? "text-green-500" : "text-red-500"}`}>
            {dayChange >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(dayChange).toFixed(2)}% 24h
          </span>
        </div>
      </div>
    </Card>
  );
}
