import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://aiinasia.com'; // Update with your actual domain

    // Fetch all published articles
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, primary_category_id')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    // Fetch all categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug');

    // Fetch all tags
    const { data: tags } = await supabase
      .from('tags')
      .select('slug');

    // Fetch all authors
    const { data: authors } = await supabase
      .from('authors')
      .select('slug');

    // Build XML sitemap
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Homepage
    sitemap += `  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;

    // Static pages
    const staticPages = [
      { path: '/about', priority: '0.8' },
      { path: '/contact', priority: '0.7' },
      { path: '/privacy', priority: '0.5' },
      { path: '/terms', priority: '0.5' },
      { path: '/cookie-policy', priority: '0.5' },
    ];

    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
    });

    // Articles
    articles?.forEach(article => {
      const lastmod = new Date(article.updated_at).toISOString().split('T')[0];
      sitemap += `  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
    });

    // Categories
    categories?.forEach(category => {
      sitemap += `  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });

    // Tags
    tags?.forEach(tag => {
      sitemap += `  <url>
    <loc>${baseUrl}/tag/${tag.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
    });

    // Authors
    authors?.forEach(author => {
      sitemap += `  <url>
    <loc>${baseUrl}/author/${author.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });

    sitemap += '</urlset>';

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
