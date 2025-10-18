import { ExternalLink } from "lucide-react";
import promptAndGoLogo from "@/assets/promptandgo-logo.png";

export const PromptAndGoBanner = () => {
  return (
    <div className="w-full">
      <a
        href="https://www.promptandgo.ai"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 h-[140px]"
        aria-label="Visit Prompt and Go AI - Better and faster AI results"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-between px-8 max-w-7xl mx-auto">
          {/* Text content */}
          <div className="flex-1 pr-8">
            <p className="text-white font-bold text-xl leading-tight mb-1">
              Better and faster AI results, every time
            </p>
            <p className="text-white/90 text-base mb-1">
              Browse 3,000+ tested prompts and let Scout optimise the prompt for your favourite AI chatbot
            </p>
            <p className="text-white/80 text-sm">
              100% Free
            </p>
          </div>

          {/* Logo on white background */}
          <div className="flex-shrink-0 bg-white rounded-lg px-8 py-4 flex items-center justify-center h-[110px] transition-all duration-300 group-hover:scale-105">
            <img
              src={promptAndGoLogo}
              alt="Prompt and Go AI"
              className="h-full w-auto object-contain"
              style={{ maxHeight: '100px', maxWidth: '350px' }}
              loading="lazy"
            />
          </div>

          {/* Hover indicator */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ExternalLink className="w-4 h-4 text-white drop-shadow-lg" />
          </div>
        </div>
      </a>
    </div>
  );
};
