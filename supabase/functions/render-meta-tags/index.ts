import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_STORAGE_PREFIX =
  'https://pbmtnvxywplgpldmlygv.supabase.co/storage/v1/object/public/article-images/';
const IMAGE_PROXY_PREFIX = 'https://aiinasia.com/images/';

function toProxyUrl(url: string): string {
  if (!url) return url;
  return url.replace(SUPABASE_STORAGE_PREFIX, IMAGE_PROXY_PREFIX);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Missing slug parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://aiinasia.com';

    // Try to find article by slug
    const { data: article, error } = await supabase
      .from('articles')
      .select('title, excerpt, image_url, slug, categories:primary_category_id(slug)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !article) {
      // Return default meta tags for non-article pages
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>AI in Asia - Latest AI News & Insights</title>
  <meta name="description" content="Your source for AI news, insights, and analysis across Asia." />
  <meta property="og:title" content="AI in Asia" />
  <meta property="og:description" content="Your source for AI news, insights, and analysis across Asia." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${baseUrl}" />
  <meta property="og:image" content="${baseUrl}/images/default-og.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="AI in Asia" />
  <meta name="twitter:description" content="Your source for AI news, insights, and analysis across Asia." />
  <meta name="twitter:image" content="${baseUrl}/images/default-og.jpg" />
</head>
<body></body>
</html>`;
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=3600' },
      });
    }

    const imageUrl = article.image_url ? toProxyUrl(article.image_url) : `${baseUrl}/images/default-og.jpg`;
    const categorySlug = (article.categories as any)?.slug || 'uncategorized';
    const articleUrl = `${baseUrl}/${categorySlug}/${article.slug}`;
    const title = article.title || 'AI in Asia';
    const description = article.excerpt || 'Latest AI news and insights from Asia.';

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>${escapeHtml(title)} | AI in Asia</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${articleUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:site_name" content="AI in Asia" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <link rel="canonical" href="${articleUrl}" />
</head>
<body></body>
</html>`;

    return new Response(html, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (error) {
    console.error('Error rendering meta tags:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
