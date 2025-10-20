import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DownloadRequest {
  imageUrl: string;
  fileName: string;
}

function cleanUrl(url: string): string {
  // Remove common corrupted UTF-8 sequences
  let cleaned = url
    .replace(/‚Äö√Ñ√´/g, '-')  // corrupted dash
    .replace(/‚Äô/g, "'")      // corrupted apostrophe
    .replace(/‚Äù/g, '"')      // corrupted quote
    .replace(/‚Äî/g, '-')      // corrupted en-dash
    .replace(/√¢‚Ç¨/g, '')     // corrupted characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // control characters
  
  // Try to encode properly if needed
  try {
    // Decode if it's double-encoded
    const decoded = decodeURIComponent(cleaned);
    // Re-encode properly
    const parts = decoded.split('/');
    const encodedParts = parts.map((part, index) => {
      // Don't encode the protocol part (https:)
      if (index < 3) return part;
      return encodeURIComponent(decodeURIComponent(part));
    });
    return encodedParts.join('/');
  } catch (e) {
    // If decoding fails, return cleaned version
    return cleaned;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Clean the URL to handle encoding issues
    const cleanedUrl = cleanUrl(imageUrl);
    console.log(`Original URL: ${imageUrl}`);
    if (cleanedUrl !== imageUrl) {
      console.log(`Cleaned URL: ${cleanedUrl}`);
    }

    console.log(`Downloading image from: ${cleanedUrl}`);

    // Download the image from the external URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let imageBlob: Blob;

    try {
      const imageResponse = await fetch(cleanedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageMigrationBot/1.0)',
          'Accept': 'image/*',
        },
      });
      clearTimeout(timeoutId);

      if (!imageResponse.ok) {
        const errorMsg = `Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`;
        console.error(errorMsg, { originalUrl: imageUrl, cleanedUrl });
        throw new Error(errorMsg);
      }

      imageBlob = await imageResponse.blob();
      console.log(`Downloaded image, size: ${imageBlob.size} bytes, type: ${imageBlob.type}`);

      if (imageBlob.size === 0) {
        throw new Error('Downloaded image is empty (0 bytes)');
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        const errorMsg = 'Download timeout - image took too long to fetch';
        console.error(errorMsg, { originalUrl: imageUrl, cleanedUrl });
        throw new Error(errorMsg);
      }
      console.error('Fetch error:', { 
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        originalUrl: imageUrl,
        cleanedUrl
      });
      throw fetchError;
    }

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      const errorMsg = 'Missing Supabase environment variables';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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