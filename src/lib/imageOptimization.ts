/**
 * Image optimization utilities for Supabase Storage and static assets
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Generates an optimized Supabase Storage image URL with transformations
 * Supabase supports image transformations via query parameters
 */
export function getOptimizedSupabaseImage(
  url: string,
  options: ImageTransformOptions = {}
): string {
  if (!url || !url.includes('supabase.co/storage')) {
    return url;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover',
  } = options;

  // Build transformation URL
  const urlObj = new URL(url);
  const params = new URLSearchParams();

  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());
  params.set('format', format);
  params.set('resize', resize);

  urlObj.search = params.toString();
  return urlObj.toString();
}

/**
 * Generates srcset for responsive images with proper DPR support
 */
export function generateResponsiveSrcSet(
  url: string,
  widths: number[] = [320, 480, 640, 960, 1280]
): string {
  if (!url.includes('supabase.co/storage')) {
    return '';
  }

  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedSupabaseImage(url, { 
        width,
        quality: 80 // Balanced quality for responsive images
      });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Get optimized avatar image with DPR support
 */
export function getOptimizedAvatar(url: string, size: number = 160): string {
  // Match display size more precisely (1.5x for balance between quality and size)
  const actualSize = Math.ceil(size * 1.5);
  return getOptimizedSupabaseImage(url, {
    width: actualSize,
    height: actualSize,
    quality: 75, // Lower quality for small avatars - still looks good
    format: 'webp',
    resize: 'cover',
  });
}

/**
 * Get optimized article thumbnail with DPR support
 */
export function getOptimizedThumbnail(
  url: string,
  width: number = 400,
  height: number = 300
): string {
  // Use 1.5x for balance (not full 2x to reduce file size)
  return getOptimizedSupabaseImage(url, {
    width: Math.ceil(width * 1.5),
    height: Math.ceil(height * 1.5),
    quality: 78, // Good balance for thumbnails
    format: 'webp',
    resize: 'cover',
  });
}

/**
 * Get optimized hero/featured image
 */
export function getOptimizedHeroImage(
  url: string,
  width: number = 1280
): string {
  return getOptimizedSupabaseImage(url, {
    width,
    quality: 82,
    format: 'webp',
  });
}

/**
 * Get optimized small thumbnail (for sidebar, list items)
 * Uses lower quality since small size makes it less noticeable
 */
export function getOptimizedSmallThumbnail(
  url: string,
  width: number = 160,
  height: number = 160
): string {
  // Use exact requested size (no DPR multiplication for tiny thumbs)
  return getOptimizedSupabaseImage(url, {
    width,
    height,
    quality: 70, // Lower quality fine for small thumbnails
    format: 'webp',
    resize: 'cover',
  });
}
