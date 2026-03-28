import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STORAGE_PREFIX =
  "https://pbmtnvxywplgpldmlygv.supabase.co/storage/v1/object/public/article-images/";
const PROXY_PREFIX = "https://aiinasia.com/images/";
const FALLBACK_IMAGE = "https://aiinasia.com/images/default-og.jpg";

const toProxyUrl = (url: string | null | undefined): string => {
  if (!url) return FALLBACK_IMAGE;
  return url.replace(STORAGE_PREFIX, PROXY_PREFIX);
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/\"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;");

const extractSlug = (searchParams: URLSearchParams): string | null => {
  const slugParam = searchParams.get("slug");
  if (slugParam) return slugParam.trim();

  const pathParam = searchParams.get("path");
  if (!pathParam) return null;

  const cleaned = pathParam.split("?")[0].replace(/\/+$/, "");
  const parts = cleaned.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestUrl = new URL(req.url);
    const slug = extractSlug(requestUrl.searchParams);
    const baseUrl = "https://aiinasia.com";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!slug) {
      const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>AI in Asia - Latest AI News & Insights</title>
  <meta name="description" content="Your source for AI news, insights, and analysis across Asia." />
  <meta property="og:title" content="AI in Asia" />
  <meta property="og:description" content="Your source for AI news, insights, and analysis across Asia." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${baseUrl}" />
  <meta property="og:image" content="${FALLBACK_IMAGE}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="AI in Asia" />
  <meta name="twitter:description" content="Your source for AI news, insights, and analysis across Asia." />
  <meta name="twitter:image" content="${FALLBACK_IMAGE}" />
</head>
<body></body>
</html>`;

      return new Response(defaultHtml, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=600",
        },
      });
    }

    const { data: article } = await supabase
      .from("articles")
      .select("title, excerpt, image_url, slug, categories:primary_category_id(slug)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    const title = article?.title ?? "AI in Asia";
    const description = article?.excerpt ?? "Latest AI news and insights from Asia.";
    const imageUrl = toProxyUrl(article?.image_url);
    const categorySlug = (article?.categories as { slug?: string } | null)?.slug ?? "news";
    const canonicalUrl = article
      ? `${baseUrl}/${categorySlug}/${article.slug}`
      : `${baseUrl}/news/${encodeURIComponent(slug)}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${escapeHtml(title)} | AI in Asia</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:site_name" content="AI in Asia" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${imageUrl}" />
</head>
<body></body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (error) {
    console.error("Error rendering meta tags:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
