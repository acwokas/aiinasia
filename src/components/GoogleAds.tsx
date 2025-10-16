import { useEffect } from "react";

interface GoogleAdProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
}

// Google Ads Publisher ID - Replace with your actual ID
const GOOGLE_ADS_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX";

const GoogleAd = ({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: GoogleAdProps) => {
  useEffect(() => {
    // Only load in production and if client ID is configured
    if (import.meta.env.PROD && GOOGLE_ADS_CLIENT !== "ca-pub-XXXXXXXXXXXXXXXX") {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, []);

  // Don't render ads in development or if not configured
  if (import.meta.env.DEV || GOOGLE_ADS_CLIENT === "ca-pub-XXXXXXXXXXXXXXXX") {
    return (
      <div
        className={`bg-muted border border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm ${className}`}
        style={{ minHeight: "280px" }}
      >
        Ad Placeholder ({format})
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client={GOOGLE_ADS_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive.toString()}
    />
  );
};

export default GoogleAd;

// Pre-configured ad components for common placements
export const HeaderAd = () => (
  <div className="container mx-auto px-4 py-2">
    <GoogleAd
      slot="XXXXXXXXXX"
      format="horizontal"
      className="w-full"
    />
  </div>
);

export const SidebarAd = ({ className = "" }: { className?: string }) => (
  <div className={className}>
    <p className="text-xs text-muted-foreground mb-2 text-center">Advertisement</p>
    <GoogleAd
      slot="XXXXXXXXXX"
      format="vertical"
    />
  </div>
);

export const InArticleAd = () => (
  <div className="my-8">
    <p className="text-xs text-muted-foreground mb-2 text-center">Advertisement</p>
    <GoogleAd
      slot="XXXXXXXXXX"
      format="rectangle"
    />
  </div>
);

export const FooterAd = () => (
  <div className="container mx-auto px-4 py-4">
    <p className="text-xs text-muted-foreground mb-2 text-center">Advertisement</p>
    <GoogleAd
      slot="XXXXXXXXXX"
      format="horizontal"
    />
  </div>
);

// Load Google AdSense script
export const loadGoogleAdsScript = () => {
  if (
    import.meta.env.PROD &&
    GOOGLE_ADS_CLIENT !== "ca-pub-XXXXXXXXXXXXXXXX" &&
    !document.querySelector('script[src*="adsbygoogle"]')
  ) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADS_CLIENT}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }
};
