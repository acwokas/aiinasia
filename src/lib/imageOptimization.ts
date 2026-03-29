/**
 * Image optimization utilities for Supabase Storage and static assets.
 * Images served via first-party proxy: /images/* → Supabase Storage
 * This keeps image domain authority on the site domain for SEO.
 */

import { SUPABASE_STORAGE_PREFIX, IMAGE_PROXY_PREFIX } from './siteConfig';

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Rewrites a Supabase Storage URL to the first-party image proxy.
 * e.g. https://pbmtnvxywplgpldmlygv.supabase.co/storage/v1/object/public/article-images/foo.jpg
 *   → /images/foo.jpg
 * Cloudflare Worker serves /images/* from Supabase with edge caching.
 * Non-matching URLs are returned unchanged.
 */
export function toProxyUrl(url: string): string {
  if (!url) return url;
  if (url.includes(SUPABASE_STORAGE_PREFIX)) {
    return url.replace(SUPABASE_STORAGE_PREFIX, IMAGE_PROXY_PREFIX);
  }
  return url;
}

/**
 * Returns true if the URL is a Supabase storage image (raw or already proxied).
 */
function isSupabaseImage(url: string): boolean {
  if (!url) return false;
  return (
    url.includes('supabase.co/storage') ||
    url.startsWith(IMAGE_PROXY_PREFIX) ||
    url.startsWith('/images/')
  );
}

/**
 * Generates an optimized image URL with Supabase transform query params.
 * Always outputs a first-party proxy URL (/images/...).
 */
export function getOptimizedSupabaseImage(
  url: string,
  options: ImageTransformOptions = {}
): string {
  if (!url || !isSupabaseImage(url)) {
    return url;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover',
  } = options;

  // Rewrite to proxy URL, strip any existing query string
  const baseUrl = toProxyUrl(url).split('?')[0];

  const params: string[] = [];
  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  params.push(`quality=${quality}`);
  params.push(`format=${format}`);
  params.push(`resize=${resize}`);

  return `${baseUrl}?${params.join('&')}`;
}

/**
 * Generates srcset for responsive images using proxy URLs.
 */
export function generateResponsiveSrcSet(
  url: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
): string {
  if (!isSupabaseImage(url)) {
    return '';
  }

  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedSupabaseImage(url, { width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Get optimized avatar image (proxy URL)
 */
export function getOptimizedAvatar(url: string, size: number = 160): string {
  return getOptimizedSupabaseImage(url, {
    width: size,
    height: size,
    quality: 85,
    format: 'webp',
    resize: 'cover',
  });
}

/**
 * Get optimized article thumbnail (proxy URL)
 */
export function getOptimizedThumbnail(
  url: string,
  width: number = 400,
  height: number = 300
): string {
  return getOptimizedSupabaseImage(url, {
    width,
    height,
    quality: 80,
    format: 'webp',
    resize: 'cover',
  });
}

/**
 * Get optimized hero/featured image (proxy URL)
 */
export function getOptimizedHeroImage(
  url: string,
  width: number = 1280
): string {
  return getOptimizedSupabaseImage(url, {
    width,
    quality: 85,
    format: 'webp',
  });
}
