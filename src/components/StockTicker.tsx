import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const StockTicker = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['stock-data'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-stock-data');
      
      if (error) throw error;
      return data as { stocks: Stock[] };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 1, // Only retry once on failure
    enabled: typeof window !== 'undefined', // Only run on client
  });

  if (isLoading || !data?.stocks) return null;

  return (
    <div className="bg-primary/5 border-y border-primary/10 overflow-hidden">
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {/* Duplicate the stocks array to create seamless loop */}
          {[...data.stocks, ...data.stocks].map((stock, index) => (
            <div
              key={`${stock.symbol}-${index}`}
              className="ticker-item inline-flex items-center gap-2 px-6 py-2"
            >
              <span className="font-semibold text-sm">{stock.name}</span>
              <span className="text-muted-foreground text-xs">{stock.symbol}</span>
              <span className="font-mono text-sm">${stock.price.toFixed(2)}</span>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stock.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {stock.changePercent.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .ticker-wrapper {
          position: relative;
          width: 100%;
        }
        
        .ticker-content {
          display: flex;
          animation: scroll 60s linear infinite;
          white-space: nowrap;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .ticker-wrapper:hover .ticker-content {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default StockTicker;
