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
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { articleId, batchMode } = await req.json();

    // Get article details
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("id, title, excerpt, content")
      .eq("id", articleId)
      .single();

    if (articleError || !article) {
      throw new Error("Article not found");
    }

    // Check if article already has comments
    const { data: existingComments } = await supabase
      .from("comments")
      .select("id")
      .eq("article_id", articleId);

    if (existingComments && existingComments.length > 0 && !batchMode) {
      return new Response(
        JSON.stringify({ message: "Article already has comments" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate random number of comments (3-6)
    const numComments = Math.floor(Math.random() * 4) + 3;

    // Realistic names pool
    const names = [
      "Sarah Chen", "Mike Johnson", "Priya Patel", "James Liu", "Emma Brown",
      "Alex Kim", "Rachel Wong", "David Singh", "Lisa Nguyen", "Tom Zhang",
      "Maya Sharma", "Chris Park", "Anna Lee", "Ben Taylor", "Nina Gupta",
      "sam_tech", "AIEnthusiast", "TechWatcher99", "FutureNow", "InnovateDaily",
      "DataDriven", "CodeMaster", "TechGuru", "AIObserver", "DigitalAge",
      "JB007", "TechSavvy", "ML_Enthusiast", "DevOps_Pro", "CloudNative"
    ];

    // Shuffle names
    const shuffledNames = names.sort(() => Math.random() - 0.5).slice(0, numComments);

    // Generate comments using AI
    const systemPrompt = `You are generating realistic blog comments for an AI/tech article. 
CRITICAL RULES:
- NEVER use em dashes (—)
- AVOID AI phrases like: "rapidly evolving", "game changer", "cutting-edge", "revolutionize", "paradigm shift", "disruptive", "innovative", "transformative"
- Write naturally like real humans commenting
- Keep comments 1-3 sentences
- Be specific to the article content
- Mix different tones: thoughtful, curious, critical, enthusiastic
- Some comments can disagree or raise questions
- Use casual language and varied perspectives
- Return ONLY a JSON array of comment strings, nothing else

Article: "${article.title}"
${article.excerpt || ""}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate ${numComments} diverse, realistic comments.` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_comments",
            description: "Generate realistic blog comments",
            parameters: {
              type: "object",
              properties: {
                comments: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of comment texts"
                }
              },
              required: ["comments"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_comments" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const parsedArgs = JSON.parse(toolCall.function.arguments);
    const comments = parsedArgs.comments;

    // Insert comments
    const commentsToInsert = comments.map((content: string, index: number) => ({
      article_id: articleId,
      content: content,
      author_name: shuffledNames[index],
      approved: true, // Auto-approve
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random time within last 7 days
    }));

    const { error: insertError } = await supabase
      .from("comments")
      .insert(commentsToInsert);

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        commentsAdded: comments.length,
        articleId: articleId
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
