import { ExternalLink } from "lucide-react";
import bannerImage from "@/assets/promptandgo-banner.jpg";

export const PromptAndGoBanner = () => {
  return (
    <div className="w-full max-w-[728px] mx-auto">
      <a
        href="https://www.promptandgo.ai"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 h-[90px]"
        aria-label="Visit Prompt and Go AI - Your AI Assistant"
      >
        <div className="w-full h-full overflow-hidden">
          <img
            src={bannerImage}
            alt="Prompt and Go AI - Your AI Assistant Platform"
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            width={728}
            height={90}
            loading="lazy"
          />
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ExternalLink className="w-4 h-4 text-white drop-shadow-lg" />
        </div>
      </a>
    </div>
  );
};
