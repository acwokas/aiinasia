import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STORAGE_PREFIX =
  "https://pbmtnvxywplgpldmlygv.supabase.co/storage/v1/object/public/article-images/";
const PROXY_PREFIX = "https://aiinasia.com/images/";

const toProxyUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  return url.replace(STORAGE_PREFIX, PROXY_PREFIX);
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = "https://aiinasia.com";

    // Fetch articles, categories, authors, and article_tags in parallel
    const [articlesRes, categoriesRes, authorsRes, articleTagsRes] = await Promise.all([
      supabase
        .from("articles")
        .select("slug, updated_at, featured_image_url, categories:primary_category_id(slug)")
        .eq("status", "published")
        .order("updated_at", { ascending: false }),
      supabase.from("categories").select("slug"),
      supabase.from("authors").select("slug"),
      // Get tag_id for each published article's tag
      supabase
        .from("article_tags")
        .select("tag_id"),
    ]);

    const articles = articlesRes.data ?? [];
    const categories = categoriesRes.data ?? [];
    const authors = authorsRes.data ?? [];

    console.log(`Articles: ${articles.length}, Categories: ${categories.length}, Authors: ${authors.length}`);

    // Get published article IDs for filtering tags
    const { data: publishedIds } = await supabase
      .from("articles")
      .select("id")
      .eq("status", "published");

    const publishedIdSet = new Set((publishedIds ?? []).map((a: { id: string }) => a.id));

    // Get all article_tags
    const { data: allArticleTags } = await supabase
      .from("article_tags")
      .select("article_id, tags(slug)");

    // Count published articles per tag
    const tagArticleCount = new Map<string, number>();
    for (const at of allArticleTags ?? []) {
      if (publishedIdSet.has(at.article_id)) {
        const tagSlug = (at.tags as { slug?: string } | null)?.slug;
        if (tagSlug) {
          tagArticleCount.set(tagSlug, (tagArticleCount.get(tagSlug) ?? 0) + 1);
        }
      }
    }
    const qualifiedTags = Array.from(tagArticleCount.entries())
      .filter(([, count]) => count >= 3)
      .map(([slug]) => ({ slug }));

    console.log(`Qualified tags (3+ articles): ${qualifiedTags.length}`);

    // Filter out /category/innovation
    const filteredCategories = categories.filter(
      (c: { slug: string }) => c.slug !== "innovation"
    );

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap +=
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    // Homepage
    sitemap += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Static pages
    const staticPages = [
      { path: "/about", priority: "0.8" },
      { path: "/contact", priority: "0.7" },
      { path: "/privacy", priority: "0.5" },
      { path: "/terms", priority: "0.5" },
      { path: "/cookie-policy", priority: "0.5" },
    ];

    for (const page of staticPages) {
      sitemap += `  <url>\n    <loc>${baseUrl}${page.path}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }

    // Articles
    for (const article of articles) {
      const lastmod = article.updated_at
        ? new Date(article.updated_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      const categorySlug = (article.categories as { slug?: string } | null)?.slug ?? "uncategorized";
      const articleUrl = `${baseUrl}/${categorySlug}/${article.slug}`;
      const imageUrl = toProxyUrl(article.featured_image_url);

      sitemap += `  <url>\n    <loc>${escapeXml(articleUrl)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>`;

      if (imageUrl) {
        sitemap += `\n    <image:image>\n      <image:loc>${escapeXml(imageUrl)}</image:loc>\n    </image:image>`;
      }

      sitemap += "\n  </url>\n";
    }

    // Categories (excluding innovation)
    for (const category of filteredCategories) {
      sitemap += `  <url>\n    <loc>${baseUrl}/category/${category.slug}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Tags with 3+ published articles only
    for (const tag of qualifiedTags) {
      sitemap += `  <url>\n    <loc>${baseUrl}/tag/${tag.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    // Authors
    for (const author of authors) {
      sitemap += `  <url>\n    <loc>${baseUrl}/voices/${author.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    sitemap += "</urlset>";

    const totalUrls = 1 + staticPages.length + articles.length + filteredCategories.length + qualifiedTags.length + authors.length;
    console.log(`Total sitemap URLs: ${totalUrls}`);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
