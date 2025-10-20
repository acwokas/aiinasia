import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

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

    console.log('Fetching all draft articles...');

    // Fetch only draft articles
    const { data: articles, error: fetchError } = await supabaseClient
      .from('articles')
      .select('id, title, slug, status, featured_on_homepage, published_at')
      .eq('status', 'draft');

    if (fetchError) {
      console.error('Error fetching articles:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${articles?.length || 0} articles to process`);

    let updatedCount = 0;
    const results = [];

    for (const article of articles || []) {
      console.log(`Publishing article: ${article.title} (${article.slug})`);
        
      try {
        const { error: updateError } = await supabaseClient
          .from('articles')
          .update({ 
            status: 'published',
            featured_on_homepage: true,
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
        } else {
          updatedCount++;
          results.push({
            id: article.id,
            slug: article.slug,
            status: 'updated'
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
      }
    }

    console.log(`Published ${updatedCount} articles`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Published ${updatedCount} articles`,
        totalProcessed: articles?.length || 0,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
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
