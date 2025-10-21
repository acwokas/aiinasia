import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const feedType = url.searchParams.get("type") || "main";
    const categorySlug = url.searchParams.get("category");
    const authorSlug = url.searchParams.get("author");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    let query = supabase
      .from("articles")
      .select(`
        *,
        authors (name, slug),
        categories:primary_category_id (name, slug)
      `)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);

    // Filter by category or author if specified
    if (categorySlug && feedType === "category") {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();
      
      if (category) {
        query = query.eq("primary_category_id", category.id);
      }
    }

    if (authorSlug && feedType === "author") {
      const { data: author } = await supabase
        .from("authors")
        .select("id")
        .eq("slug", authorSlug)
        .single();
      
      if (author) {
        query = query.eq("author_id", author.id);
      }
    }

    const { data: articles, error } = await query;

    if (error) throw error;

    // Generate RSS feed
    const siteUrl = "https://aiinasia.com";
    const feedTitle = categorySlug 
      ? `AI in ASIA - ${categorySlug}`
      : authorSlug
      ? `AI in ASIA - ${authorSlug}`
      : "AI in ASIA";
    
    const feedDescription = categorySlug
      ? `Latest AI news and insights in ${categorySlug} from AI in ASIA`
      : authorSlug
      ? `Articles by ${authorSlug} on AI in ASIA`
      : "Your trusted source for AI news, insights, and education across Asia";

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${feedTitle}</title>
    <link>${siteUrl}</link>
    <description>${feedDescription}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss${categorySlug ? `?category=${categorySlug}` : authorSlug ? `?author=${authorSlug}` : ''}" rel="self" type="application/rss+xml" />
    ${articles?.map(article => {
      const articleUrl = `${siteUrl}/${article.categories?.slug || 'uncategorized'}/${article.slug}`;
      const content = typeof article.content === 'string' 
        ? article.content 
        : JSON.stringify(article.content);
      
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${new Date(article.published_at).toUTCString()}</pubDate>
      <author>${article.authors?.name || 'AI in ASIA'}</author>
      <category>${article.categories?.name || 'Uncategorized'}</category>
      ${article.featured_image_url ? `<enclosure url="${article.featured_image_url}" type="image/jpeg" />` : ''}
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <content:encoded><![CDATA[
        ${article.featured_image_url ? `<img src="${article.featured_image_url}" alt="${article.title}" />` : ''}
        <p>${article.excerpt || ''}</p>
        ${content}
      ]]></content:encoded>
    </item>`;
    }).join('')}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("RSS generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
