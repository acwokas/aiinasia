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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find articles published in the last 24 hours without comments
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("id, title")
      .eq("status", "published")
      .gte("published_at", oneDayAgo);

    if (articlesError) {
      throw articlesError;
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No new articles found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const article of articles) {
      // Check if article already has comments
      const { data: existingComments } = await supabase
        .from("comments")
        .select("id")
        .eq("article_id", article.id);

      if (existingComments && existingComments.length >= 3) {
        continue; // Skip if already has 3+ comments
      }

      // Call the generate-article-comments function using supabase.functions.invoke
      const { data: result, error: invokeError } = await supabase.functions.invoke(
        'generate-article-comments',
        {
          body: { articleId: article.id, batchMode: false }
        }
      );

      results.push({
        articleId: article.id,
        title: article.title,
        success: !invokeError,
        result: invokeError ? { error: invokeError.message } : result
      });
    }

    return new Response(
      JSON.stringify({ 
        processed: results.length,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
