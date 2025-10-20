import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DownloadRequest {
  imageUrl: string;
  fileName: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, fileName }: DownloadRequest = await req.json();

    if (!imageUrl || !fileName) {
      return new Response(
        JSON.stringify({ error: 'imageUrl and fileName are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Downloading image from: ${imageUrl}`);

    // Download the image from the external URL
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageMigrationBot/1.0)',
        'Accept': 'image/*',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    console.log(`Downloaded image, size: ${imageBlob.size} bytes, type: ${imageBlob.type}`);

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const filePath = `migrated/${Date.now()}-${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filePath, imageBlob, {
        contentType: imageBlob.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload to storage: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('article-images')
      .getPublicUrl(filePath);

    console.log(`Successfully uploaded to: ${publicUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        publicUrl,
        originalUrl: imageUrl 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});