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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { articleId } = await req.json();

    if (!articleId) {
      throw new Error("Article ID is required");
    }

    // Get article content
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("title, excerpt, content")
      .eq("id", articleId)
      .single();

    if (articleError || !article) {
      throw new Error("Article not found");
    }

    // Get all available tags
    const { data: allTags } = await supabase
      .from("tags")
      .select("id, name")
      .order("name");

    if (!allTags || allTags.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tags available in system" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to suggest relevant tags
    if (LOVABLE_API_KEY) {
      const tagNames = allTags.map(t => t.name).join(", ");
      const contentPreview = typeof article.content === 'string' 
        ? article.content.substring(0, 500) 
        : JSON.stringify(article.content).substring(0, 500);

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a content tagging AI. Analyze articles and suggest 3-5 most relevant tags from the provided list."
            },
            {
              role: "user",
              content: `Article Title: ${article.title}\n\nExcerpt: ${article.excerpt}\n\nContent Preview: ${contentPreview}\n\nAvailable tags: ${tagNames}\n\nSelect 3-5 most relevant tags. Return ONLY a comma-separated list of tag names, nothing else.`
            }
          ]
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const suggestedTags = aiData.choices[0]?.message?.content
          ?.toLowerCase()
          .split(',')
          .map((tag: string) => tag.trim())
          .filter(Boolean) || [];

        // Match suggested tags with actual tag IDs
        const matchedTags = allTags.filter(tag => 
          suggestedTags.some((suggested: string) => 
            tag.name.toLowerCase().includes(suggested) || suggested.includes(tag.name.toLowerCase())
          )
        ).slice(0, 5); // Limit to 5 tags

        if (matchedTags.length > 0) {
          // Delete existing tags for this article
          await supabase
            .from("article_tags")
            .delete()
            .eq("article_id", articleId);

          // Insert new tags
          const tagInserts = matchedTags.map(tag => ({
            article_id: articleId,
            tag_id: tag.id
          }));

          await supabase
            .from("article_tags")
            .insert(tagInserts);

          return new Response(
            JSON.stringify({ 
              success: true, 
              tags: matchedTags.map(t => t.name),
              message: `Successfully assigned ${matchedTags.length} tags`
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Fallback: Basic keyword matching
    const articleText = `${article.title} ${article.excerpt}`.toLowerCase();
    const matchedTags = allTags.filter(tag => 
      articleText.includes(tag.name.toLowerCase())
    ).slice(0, 3);

    if (matchedTags.length > 0) {
      await supabase
        .from("article_tags")
        .delete()
        .eq("article_id", articleId);

      const tagInserts = matchedTags.map(tag => ({
        article_id: articleId,
        tag_id: tag.id
      }));

      await supabase
        .from("article_tags")
        .insert(tagInserts);

      return new Response(
        JSON.stringify({ 
          success: true, 
          tags: matchedTags.map(t => t.name),
          message: `Assigned ${matchedTags.length} tags using keyword matching`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "No matching tags found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Smart tagging error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
