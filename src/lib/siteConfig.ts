/**
 * Site configuration — centralized constants for branding, URLs, and third-party IDs.
 * When cloning this site for a new domain (e.g. aiinarabia.com), update THIS FILE
 * plus the environment variables in .env / hosting config.
 *
 * For values that differ between environments (dev/staging/prod), use env vars.
 * For values that are the same everywhere, define them here.
 */

// --- Branding ---
export const SITE_NAME = 'AI in ASIA';
export const SITE_NAME_SHORT = 'AIinASIA';
export const SITE_TAGLINE = 'AI News, Insights & Innovation Across Asia';
export const SITE_DESCRIPTION = 'Your trusted source for AI news, insights, and education across Asia-Pacific. Breaking news, expert analysis, and practical guides on artificial intelligence.';
export const SITE_DOMAIN = 'aiinasia.com';
export const SITE_URL = 'https://aiinasia.com';
export const SITE_LANGUAGE = 'en-GB';

// --- Social ---
export const TWITTER_HANDLE = '@AI_in_Asia';
export const TWITTER_URL = 'https://x.com/AI_in_Asia';

// --- Analytics & Ads (override via env vars VITE_GA_MEASUREMENT_ID / VITE_GOOGLE_ADS_CLIENT) ---
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-M981596ST2';
export const GOOGLE_ADS_CLIENT = import.meta.env.VITE_GOOGLE_ADS_CLIENT || 'ca-pub-4181437297386228';

// --- Supabase (actual data project — NOT the Lovable-managed project) ---
export const SUPABASE_STORAGE_PREFIX =
  'https://pbmtnvxywplgpldmlygv.supabase.co/storage/v1/object/public/article-images/';
export const IMAGE_PROXY_PREFIX = '/images/';

// --- Default images ---
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_FALLBACK_IMAGE = `${SITE_URL}/icons/aiinasia-192.png`;

// --- Contact ---
export const CONTACT_EMAIL = 'hello@aiinasia.com';
