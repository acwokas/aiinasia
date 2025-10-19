import { ExternalLink } from "lucide-react";
import promptAndGoLogo from "@/assets/promptandgo-logo.png";

export const PromptAndGoBanner = () => {
  return (
    <div className="w-full max-w-[640px] md:max-w-full mx-auto">
      <a
        href="https://www.promptandgo.ai"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 h-[100px] md:h-[140px]"
        aria-label="Visit Prompt and Go AI - Better and faster AI results"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          {/* Text content */}
          <div className="flex-1 pr-3 md:pr-8">
            <p className="text-white font-bold text-sm md:text-xl leading-tight mb-0.5 md:mb-1">
              Better and faster AI results, every time
            </p>
            <p className="text-white/90 text-xs md:text-base mb-0.5 md:mb-1 line-clamp-2 md:line-clamp-none">
              Browse 3,000+ tested prompts and let Scout optimise the prompt for your favourite AI chatbot
            </p>
            <p className="text-white/80 text-xs md:text-sm">
              100% Free
            </p>
          </div>

          {/* Logo on white background */}
          <div className="flex-shrink-0 bg-white rounded-lg px-3 py-2 md:px-8 md:py-4 flex items-center justify-center h-[70px] md:h-[110px] transition-all duration-300 group-hover:scale-105">
            <img
              src={promptAndGoLogo}
              alt="Prompt and Go AI"
              className="h-full w-auto object-contain max-h-[60px] max-w-[150px] md:max-h-[100px] md:max-w-[350px]"
              loading="lazy"
            />
          </div>

          {/* Hover indicator */}
          <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-white drop-shadow-lg" />
          </div>
        </div>
      </a>
    </div>
  );
};
