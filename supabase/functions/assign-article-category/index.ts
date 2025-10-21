import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase for auth check
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.3");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check authentication and admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin"
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { articleId, articleTitle, articleExcerpt, articleContent, categories } = await req.json();

    if (!articleId || !categories || categories.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Prepare article content for analysis
    let contentText = articleTitle || "";
    if (articleExcerpt) contentText += "\n\n" + articleExcerpt;
    
    // Extract text from content blocks
    if (articleContent && Array.isArray(articleContent)) {
      articleContent.forEach((block: any) => {
        if (block.type === "paragraph" && block.data?.text) {
          contentText += "\n" + block.data.text.replace(/<[^>]*>/g, '');
        } else if (block.type === "header" && block.data?.text) {
          contentText += "\n" + block.data.text;
        }
      });
    }

    // Prepare categories list
    const categoriesList = categories.map((cat: any) => 
      `- ${cat.name} (${cat.slug}): ${cat.description || 'No description'}`
    ).join('\n');

    const prompt = `Analyze this article and assign it to the most appropriate category.

Available categories:
${categoriesList}

Article to analyze:
${contentText.slice(0, 3000)}

Return ONLY the category slug (e.g., "news", "business", "learn", etc.) that best fits this article. Choose the single most appropriate category based on the article's main focus and content.`;

    console.log("Analyzing article:", articleId);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are a content categorization expert. Respond with only the category slug, nothing else."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const suggestedSlug = aiResponse.choices[0].message.content.trim().toLowerCase();

    // Find the category by slug
    const matchedCategory = categories.find((cat: any) => 
      cat.slug === suggestedSlug || cat.name.toLowerCase() === suggestedSlug
    );

    if (!matchedCategory) {
      console.error("Could not match suggested category:", suggestedSlug);
      // Default to "news" if no match found
      const defaultCategory = categories.find((cat: any) => cat.slug === "news");
      return new Response(
        JSON.stringify({
          articleId,
          categoryId: defaultCategory?.id || categories[0].id,
          categoryName: defaultCategory?.name || categories[0].name,
          confidence: "low"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Assigned category:", matchedCategory.name);

    return new Response(
      JSON.stringify({
        articleId,
        categoryId: matchedCategory.id,
        categoryName: matchedCategory.name,
        confidence: "high"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in assign-article-category:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
