import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all articles with JSON content
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('id, slug, title, content, tldr_snapshot')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    const results = {
      total: articles?.length || 0,
      processed: 0,
      tldrFixed: 0,
      errors: [] as any[],
    };

    for (const article of articles || []) {
      try {
        let content = article.content;
        let tldrSnapshot = article.tldr_snapshot || [];
        let needsUpdate = false;

        // Parse content if it's a string
        if (typeof content === 'string') {
          try {
            content = JSON.parse(content);
          } catch {
            // Skip if not JSON
            continue;
          }
        }

        // Check if content is an array of blocks
        if (!Array.isArray(content)) continue;

        // Find TL;DR heading and extract bullets
        let newContent = [];
        let foundTldr = false;
        let tldrList: string[] = [];

        for (let i = 0; i < content.length; i++) {
          const block = content[i];

          // Check if this is a TL;DR heading
          if (block.type === 'heading' && block.content && 
              (block.content.toLowerCase().includes('tl;dr') || 
               block.content.toLowerCase().includes('tldr'))) {
            foundTldr = true;
            needsUpdate = true;
            // Skip this heading block
            continue;
          }

          // If we just found TL;DR and next block is a list, extract it for tldr_snapshot
          if (foundTldr && block.type === 'list' && !tldrList.length) {
            if (Array.isArray(block.content)) {
              tldrList = block.content.map((item: any) => 
                typeof item === 'string' ? item : String(item)
              );
            } else if (typeof block.content === 'string') {
              tldrList = [block.content];
            }
            tldrSnapshot = tldrList;
            foundTldr = false;
            needsUpdate = true;
            // Skip the list block that follows TL;DR
            continue;
          }

          // Reset foundTldr if we hit another block type
          if (foundTldr && block.type !== 'list') {
            foundTldr = false;
          }

          newContent.push(block);
        }

        // Update article if changes were made
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('articles')
            .update({
              content: newContent,
              tldr_snapshot: tldrSnapshot,
            })
            .eq('id', article.id);

          if (updateError) throw updateError;

          results.processed++;
          if (tldrList.length > 0) {
            results.tldrFixed++;
          }
        }
      } catch (error: any) {
        results.errors.push({
          slug: article.slug,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error fixing migrated content:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
