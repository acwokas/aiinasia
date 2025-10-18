import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import promptAndGoLogo from "@/assets/promptandgo-logo.png";

export const PromptAndGoBanner = () => {
  return (
    <div className="w-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          <a
            href="https://www.promptandgo.ai"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block group"
            aria-label="Visit Prompt and Go AI - Better and faster AI results"
          >
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Logo */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:bg-white/20">
                <img
                  src={promptAndGoLogo}
                  alt="Prompt and Go AI Logo"
                  className="h-16 md:h-20 w-auto"
                  loading="lazy"
                />
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  Better and faster AI results,<br />every time
                </h2>
                <div className="flex items-center justify-center gap-2 text-white/90">
                  <Sparkles className="h-5 w-5" />
                  <p className="text-lg md:text-xl">
                    Completely Free
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-lg md:text-2xl text-white/90 max-w-3xl leading-relaxed">
                Browse <span className="font-bold text-white">3,000+ tested prompts</span>, use specialized <span className="font-bold text-white">Power Packs</span>, and let <span className="font-bold text-white">Scout</span> optimize everything for your favorite AI platform.
              </p>

              {/* CTA Button */}
              <Button 
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90 text-xl px-12 py-6 h-auto font-bold transition-all duration-300 group-hover:scale-110 shadow-2xl"
              >
                Get Started Free
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  ✓ 3,000+ Prompts
                </div>
                <div className="flex items-center gap-2">
                  ✓ Power Packs
                </div>
                <div className="flex items-center gap-2">
                  ✓ AI Scout Optimization
                </div>
                <div className="flex items-center gap-2">
                  ✓ 100% Free
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
    </div>
  );
};
