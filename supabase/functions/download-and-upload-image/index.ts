import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { requireAdmin, getUserFromAuth } from '../_shared/requireAdmin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DownloadRequest {
  imageUrl: string;
  fileName: string;
}

function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Split path into parts
    const pathParts = urlObj.pathname.split('/');
    
    // Encode each part of the path
    const encodedPath = pathParts.map((part, index) => {
      if (index === 0 || !part) return part;
      // Keep the part as-is but properly encode it
      return encodeURIComponent(part);
    }).join('/');
    
    urlObj.pathname = encodedPath;
    return urlObj.toString();
  } catch (e) {
    console.warn('URL encoding failed:', e);
    return url;
  }
}

function createUrlVariants(url: string): string[] {
  const variants: string[] = [url]; // Original first
  
  // Variant 2: Properly encoded version
  const encoded = cleanUrl(url);
  if (encoded !== url) {
    variants.push(encoded);
  }
  
  // Variant 3: Replace corrupted DALL-E patterns
  const dalleFixed = url
    .replace(/DALL[^\-E]*E/gi, 'DALLE')
    .replace(/DALLE/g, 'DALL-E');
  if (dalleFixed !== url && !variants.includes(dalleFixed)) {
    variants.push(dalleFixed);
  }
  
  // Variant 4: Encoded DALL-E fix
  const dalleFixedEncoded = cleanUrl(dalleFixed);
  if (!variants.includes(dalleFixedEncoded)) {
    variants.push(dalleFixedEncoded);
  }
  
  return variants;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      const errorMsg = 'Missing Supabase environment variables';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    const user = await getUserFromAuth(supabase, authHeader);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await requireAdmin(supabase, user.id);

    const { imageUrl, fileName }: DownloadRequest = await req.json();

    if (!imageUrl || !fileName) {
      console.error('Missing required parameters:', { imageUrl: !!imageUrl, fileName: !!fileName });
      return new Response(
        JSON.stringify({ error: 'imageUrl and fileName are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Try multiple URL variants to handle corrupted encoding
    const urlVariants = createUrlVariants(imageUrl);
    console.log(`Original URL: ${imageUrl}`);
    console.log(`Trying ${urlVariants.length} URL variants`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let imageBlob: Blob | undefined;
    let successfulUrl: string | undefined;

    for (let i = 0; i < urlVariants.length; i++) {
      const urlToTry = urlVariants[i];
      try {
        console.log(`[${i + 1}/${urlVariants.length}] Trying: ${urlToTry}`);
        const imageResponse = await fetch(urlToTry, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ImageMigrationBot/1.0)',
            'Accept': 'image/*',
          },
        });

        if (imageResponse.ok) {
          imageBlob = await imageResponse.blob();
          
          if (imageBlob.size === 0) {
            console.log(`Downloaded 0 bytes, trying next variant`);
            continue;
          }
          
          successfulUrl = urlToTry;
          console.log(`✓ Success! Downloaded ${imageBlob.size} bytes (variant ${i + 1})`);
          break;
        } else {
          console.log(`✗ HTTP ${imageResponse.status}, trying next variant`);
        }
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          clearTimeout(timeoutId);
          throw new Error('Download timeout - image took too long to fetch');
        }
        console.log(`✗ Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
      }
    }

    clearTimeout(timeoutId);

    if (!imageBlob || !successfulUrl) {
      console.error('All URL variants failed:', urlVariants);
      throw new Error(`Failed to download image. Tried ${urlVariants.length} URL variants. Image may not exist on server.`);
    }

    // Upload to Supabase Storage (using existing client)
    const filePath = `migrated/${Date.now()}-${fileName}`;

    console.log(`Uploading to storage: ${filePath}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filePath, imageBlob, {
        contentType: imageBlob.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', { 
        message: uploadError.message,
        name: uploadError.name,
        filePath,
        blobSize: imageBlob.size,
        blobType: imageBlob.type
      });
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
    console.error('Error in download-and-upload-image:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});