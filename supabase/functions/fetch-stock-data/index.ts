import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Major AI companies (publicly traded)
const AI_STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: '0700.HK', name: 'Tencent' },
  { symbol: 'BABA', name: 'Alibaba' },
  { symbol: 'BIDU', name: 'Baidu' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AMD', name: 'AMD' },
  { symbol: 'TSM', name: 'TSMC' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching stock data for AI companies...');

    const stockData = await Promise.all(
      AI_STOCKS.map(async (stock) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${finnhubApiKey}`
          );
          
          if (!response.ok) {
            console.error(`Failed to fetch ${stock.symbol}: ${response.status}`);
            return null;
          }

          const data = await response.json();
          
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: data.c,
            change: data.d,
            changePercent: data.dp,
          };
        } catch (error) {
          console.error(`Error fetching ${stock.symbol}:`, error);
          return null;
        }
      })
    );

    const validStocks = stockData.filter(stock => stock !== null && stock.price > 0);

    console.log(`Successfully fetched ${validStocks.length} stocks`);

    return new Response(
      JSON.stringify({ stocks: validStocks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-stock-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
