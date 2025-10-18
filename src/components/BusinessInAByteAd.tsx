import { ExternalLink, Rocket } from "lucide-react";
import businessInAByteLogo from "@/assets/businessinabyte-logo.png";

export const BusinessInAByteAd = () => {
  return (
    <div className="w-[300px] h-[250px] mx-auto">
      <a
        href="https://www.businessinabyte.com"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block relative group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-full bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500"
        aria-label="Visit Business in a Byte - Launch Your Startup in 7 Days"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-between p-6 text-center">
          {/* Logo */}
          <div className="bg-white rounded-lg p-3 w-full transition-all duration-300 group-hover:scale-105">
            <img
              src={businessInAByteLogo}
              alt="Business in a Byte"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center space-y-3 mt-4">
            <div className="flex items-center justify-center gap-2">
              <Rocket className="w-5 h-5 text-white" />
              <p className="text-white font-bold text-lg leading-tight">
                Launch in 7 Days
              </p>
            </div>
            
            <p className="text-white text-sm leading-snug">
              Free tools and playbooks. Built for entrepreneurs who move fast.
            </p>
          </div>

          {/* CTA */}
          <div className="w-full bg-black text-white rounded-md px-4 py-2.5 font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-gray-900 transition-colors">
            Get Started Free
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </a>
    </div>
  );
};
