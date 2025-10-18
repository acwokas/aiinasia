import { ExternalLink } from "lucide-react";
import promptAndGoLogo from "@/assets/promptandgo-logo.png";

export const PromptAndGoBanner = () => {
  return (
    <div className="w-full max-w-[728px] mx-auto">
      <a
        href="https://www.promptandgo.ai"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block w-[728px] h-[90px] relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
        aria-label="Visit Prompt and Go AI - Better and faster AI results"
      >
        <div className="absolute inset-0 flex items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={promptAndGoLogo}
              alt="Prompt and Go AI"
              className="h-10 w-auto"
              loading="lazy"
            />
          </div>

          {/* Text content */}
          <div className="flex-1 px-4 text-center">
            <p className="text-white font-bold text-sm leading-tight">
              Better and faster AI results, every time
            </p>
            <p className="text-white/90 text-xs mt-1">
              3,000+ prompts • 100% Free
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 bg-white rounded-md px-4 py-2 group-hover:bg-white/90 transition-colors">
            <span className="text-purple-600 font-bold text-sm whitespace-nowrap">
              Get Started
            </span>
            <ExternalLink className="w-3 h-3 text-purple-600" />
          </div>
        </div>
      </a>
    </div>
  );
};
