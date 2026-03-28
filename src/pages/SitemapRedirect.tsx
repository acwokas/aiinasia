import { useEffect } from 'react';

const SitemapRedirect = () => {
  useEffect(() => {
    // Redirect to the sitemap served by Cloudflare Worker
    window.location.href = '/sitemap.xml';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to sitemap...</p>
    </div>
  );
};

export default SitemapRedirect;
