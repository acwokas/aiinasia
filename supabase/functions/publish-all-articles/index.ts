import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { requireAdmin, getUserFromAuth } from '../_shared/requireAdmin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    const user = await getUserFromAuth(supabaseClient, authHeader);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await requireAdmin(supabaseClient, user.id);

    console.log('Fetching all draft articles...');

    // Fetch only draft articles
    const { data: articles, error: fetchError } = await supabaseClient
      .from('articles')
      .select('id, title, slug, status, published_at')
      .eq('status', 'draft');

    if (fetchError) {
      console.error('Error fetching articles:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${articles?.length || 0} articles to process`);

    // Create a ReadableStream for progress updates
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        const sendUpdate = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        let updatedCount = 0;
        const results = [];
        const total = articles?.length || 0;

        sendUpdate({ type: 'total', count: total });

        for (const article of articles || []) {
          console.log(`Publishing article: ${article.title} (${article.slug})`);
          
          try {
            const { error: updateError } = await supabaseClient
              .from('articles')
              .update({ 
                status: 'published',
                published_at: article.published_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', article.id);

            if (updateError) {
              console.error(`Error updating article ${article.slug}:`, updateError);
              results.push({
                id: article.id,
                slug: article.slug,
                status: 'error',
                error: updateError.message
              });
              sendUpdate({ 
                type: 'error', 
                article: article.slug,
                progress: Math.round(((updatedCount + 1) / total) * 100)
              });
            } else {
              updatedCount++;
              results.push({
                id: article.id,
                slug: article.slug,
                status: 'updated'
              });
              sendUpdate({ 
                type: 'progress', 
                article: article.slug,
                count: updatedCount,
                progress: Math.round((updatedCount / total) * 100)
              });
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Error processing article ${article.slug}:`, error);
            results.push({
              id: article.id,
              slug: article.slug,
              status: 'error',
              error: errorMessage
            });
            sendUpdate({ 
              type: 'error', 
              article: article.slug,
              progress: Math.round(((updatedCount + 1) / total) * 100)
            });
          }
        }

        console.log(`Published ${updatedCount} articles`);

        sendUpdate({
          type: 'complete',
          success: true,
          message: `Published ${updatedCount} articles`,
          totalProcessed: total,
          results: results
        });

        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in publish-all-articles function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
