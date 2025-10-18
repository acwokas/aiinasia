import { ExternalLink } from "lucide-react";
import promptAndGoLogo from "@/assets/promptandgo-logo.png";

export const PromptAndGoBanner = () => {
  return (
    <div className="w-full flex justify-center">
      <a
        href="https://www.promptandgo.ai"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        style={{ width: '728px', height: '90px' }}
        aria-label="Visit Prompt and Go AI - Better and faster AI results"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-between px-6">
          {/* Text content */}
          <div className="flex-1 pr-4">
            <p className="text-white font-bold text-base leading-tight mb-1">
              Better and faster AI results
            </p>
            <p className="text-white/90 text-xs">
              3,000+ tested prompts • 100% Free
            </p>
          </div>

          {/* Logo on white background */}
          <div className="flex-shrink-0 bg-white rounded-md px-4 py-2 flex items-center justify-center h-[70px] transition-all duration-300 group-hover:scale-105">
            <img
              src={promptAndGoLogo}
              alt="Prompt and Go AI"
              className="h-full w-auto object-contain"
              style={{ maxHeight: '60px' }}
              loading="lazy"
            />
          </div>

          {/* Hover indicator */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ExternalLink className="w-3 h-3 text-white drop-shadow-lg" />
          </div>
        </div>
      </a>
    </div>
  );
};
