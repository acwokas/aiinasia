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
        <a
          href="https://www.promptandgo.ai"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block group"
          aria-label="Visit Prompt and Go AI - Better and faster AI results"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left side - Text content */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Better and faster AI results, every time
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/90">
                  <Sparkles className="h-5 w-5" />
                  <p className="text-lg md:text-xl">
                    Completely Free
                  </p>
                </div>
              </div>

              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                Browse <span className="font-bold text-white">3,000+ tested prompts</span>, use specialized <span className="font-bold text-white">Power Packs</span>, and let <span className="font-bold text-white">Scout</span> optimize everything for your favorite AI platform.
              </p>

              <Button 
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90 text-xl px-12 py-6 h-auto font-bold transition-all duration-300 group-hover:scale-105 shadow-2xl"
              >
                Get Started Free
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  ✓ 3,000+ Prompts
                </div>
                <div className="flex items-center gap-2">
                  ✓ Power Packs
                </div>
                <div className="flex items-center gap-2">
                  ✓ AI Scout
                </div>
                <div className="flex items-center gap-2">
                  ✓ 100% Free
                </div>
              </div>
            </div>

            {/* Right side - Logo */}
            <div className="flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:bg-white/20">
                <img
                  src={promptAndGoLogo}
                  alt="Prompt and Go AI"
                  className="w-[400px] md:w-[500px] h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </a>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
    </div>
  );
};
