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

    // Get all articles
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('id, slug, title, content')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    const results = {
      total: articles?.length || 0,
      processed: 0,
      cleaned: 0,
      errors: [] as any[],
    };

    // Process in batches to avoid timeouts
    const BATCH_SIZE = 20;
    const batches = [];
    
    for (let i = 0; i < (articles?.length || 0); i += BATCH_SIZE) {
      batches.push(articles!.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (article) => {
          try {
            let content = article.content;
            let needsUpdate = false;

            // Handle string content (markdown)
            if (typeof content === 'string') {
              const originalContent = content;
              
              // Remove Tweet links in various formats
              content = content
                // Remove HTML tweet links
                .replace(/<a[^>]*>\s*Tweet\s*<\/a>/gi, '')
                // Remove markdown tweet links
                .replace(/\[Tweet\]\([^)]*\)/gi, '')
                // Remove standalone Tweet text (but be careful with context)
                .replace(/^\s*Tweet\s*$/gm, '')
                // Clean up any double spaces or line breaks left behind
                .replace(/\n\n\n+/g, '\n\n')
                .replace(/  +/g, ' ');

              if (content !== originalContent) {
                needsUpdate = true;
              }
            }
            
            // Handle JSON content (legacy format)
            else if (Array.isArray(content)) {
              const originalContent = JSON.stringify(content);
              
              for (let i = 0; i < content.length; i++) {
                const block = content[i];
                
                if (block.content && typeof block.content === 'string') {
                  const originalBlockContent = block.content;
                  
                  // Clean tweet links from block content
                  block.content = block.content
                    .replace(/<a[^>]*>\s*Tweet\s*<\/a>/gi, '')
                    .replace(/\[Tweet\]\([^)]*\)/gi, '')
                    .replace(/^\s*Tweet\s*$/gm, '')
                    .trim();
                  
                  if (block.content !== originalBlockContent) {
                    needsUpdate = true;
                  }
                }
                
                // Handle list items
                if (block.type === 'list' && Array.isArray(block.content)) {
                  for (let j = 0; j < block.content.length; j++) {
                    const item = block.content[j];
                    if (typeof item === 'string') {
                      const originalItem = item;
                      block.content[j] = item
                        .replace(/<a[^>]*>\s*Tweet\s*<\/a>/gi, '')
                        .replace(/\[Tweet\]\([^)]*\)/gi, '')
                        .trim();
                      
                      if (block.content[j] !== originalItem) {
                        needsUpdate = true;
                      }
                    }
                  }
                }
              }

              if (needsUpdate && JSON.stringify(content) !== originalContent) {
                needsUpdate = true;
              }
            }

            // Update article if changes were made
            if (needsUpdate) {
              const { error: updateError } = await supabase
                .from('articles')
                .update({ content })
                .eq('id', article.id);

              if (updateError) throw updateError;

              results.processed++;
              results.cleaned++;
            } else {
              results.processed++;
            }
          } catch (error: any) {
            results.errors.push({
              slug: article.slug,
              error: error.message,
            });
          }
        })
      );
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
    console.error('Error removing tweet links:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
