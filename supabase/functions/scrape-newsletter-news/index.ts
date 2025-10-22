import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { getUserFromAuth, requireAdmin } from '../_shared/requireAdmin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  headline: string;
  insight: string;
  source_url: string;
}

async function scrapeSource(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    console.log(`Scraping ${sourceName} from ${url}`);
    const response = await fetch(url);
    const html = await response.text();
    
    const items: NewsItem[] = [];
    
    // Parse headlines and links - using simple regex patterns
    // Different sources have different structures, so we'll use generic patterns
    const headlinePatterns = [
      /<h2[^>]*>(.*?)<\/h2>/gi,
      /<h3[^>]*>(.*?)<\/h3>/gi,
      /<a[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/a>/gi,
    ];
    
    const linkPattern = /<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
    
    let matches;
    const seenUrls = new Set<string>();
    
    // Extract links and headlines
    while ((matches = linkPattern.exec(html)) !== null && items.length < 10) {
      const href = matches[1];
      const text = matches[2].replace(/<[^>]*>/g, '').trim();
      
      // Filter for relevant links
      if (
        text.length > 20 && 
        text.length < 200 &&
        (href.includes('/news/') || href.includes('/article/') || href.includes('/story/')) &&
        (text.toLowerCase().includes('ai') || text.toLowerCase().includes('artificial intelligence') || 
         text.toLowerCase().includes('tech') || text.toLowerCase().includes('startup'))
      ) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, url).href;
        
        if (!seenUrls.has(fullUrl)) {
          seenUrls.add(fullUrl);
          items.push({
            headline: text,
            insight: `Latest from ${sourceName}`,
            source_url: fullUrl,
          });
        }
      }
    }
    
    console.log(`Found ${items.length} items from ${sourceName}`);
    return items;
  } catch (error) {
    console.error(`Error scraping ${sourceName}:`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate admin
    const authHeader = req.headers.get('Authorization');
    const user = await getUserFromAuth(supabase, authHeader);
    
    if (user) {
      await requireAdmin(supabase, user.id);
    }

    console.log('Starting news scraping...');

    // Fetch active news sources
    const { data: sources, error: sourcesError } = await supabase
      .from('newsletter_news_sources')
      .select('*')
      .eq('is_active', true);

    if (sourcesError) {
      throw sourcesError;
    }

    console.log(`Found ${sources?.length || 0} active news sources`);

    let allItems: NewsItem[] = [];

    // Scrape each source
    for (const source of sources || []) {
      const items = await scrapeSource(source.url, source.name);
      allItems = allItems.concat(items);
      
      // Update last_scraped_at
      await supabase
        .from('newsletter_news_sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', source.id);
    }

    console.log(`Total items scraped: ${allItems.length}`);

    // Insert new quick takes (not assigned to any edition yet)
    const { data: inserted, error: insertError } = await supabase
      .from('newsletter_quick_takes')
      .insert(allItems.map(item => ({
        headline: item.headline,
        insight: item.insight,
        source_url: item.source_url,
        manually_selected: false,
      })))
      .select();

    if (insertError) {
      console.error('Error inserting quick takes:', insertError);
      throw insertError;
    }

    console.log(`Inserted ${inserted?.length || 0} new quick takes`);

    return new Response(
      JSON.stringify({
        success: true,
        scraped: allItems.length,
        inserted: inserted?.length || 0,
        sources: sources?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in scrape-newsletter-news:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
