import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const WelcomePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("welcome-popup-seen");
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("welcome-popup-seen", "true");
    setIsVisible(false);
  };

  const handleSignUp = () => {
    handleClose();
    navigate("/auth");
  };

  const handleNewsletter = () => {
    handleClose();
    navigate("/newsletter");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-lg shadow-lg p-8 animate-in zoom-in-95 slide-in-from-bottom-4">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="headline text-3xl text-primary">
              Welcome to the New AI in Asia{isMobile ? "!" : ""}
            </h2>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-3">
              {isMobile ? (
                <>
                  <p>
                    We've had a glow up and joined the <strong>You.WithThePowerOf.AI Collective</strong> to 
                    bring you more stories, ideas, inspiration, and an active community.
                  </p>
                  <p>
                    🎁 <strong>New:</strong> Sign up for a free account to earn rewards across all projects.
                  </p>
                  <p>
                    Thanks for being part of the journey. Your support keeps this amazing community thriving!
                  </p>
                </>
              ) : (
                <>
                  <p>
                    We've had a glow up! Our redesigned home is now part of the <strong>You.WithThePowerOf.AI Collective</strong>, 
                    bringing you even more stories, ideas, and inspiration from across the region.
                  </p>
                  <p>
                    Thanks for being here, whether you've been with us from the start or just found us, 
                    you're what makes this community special.
                  </p>
                  <p>
                    🎁 <strong>New:</strong> Create a free account to earn rewards you can use across all 
                    You.WithThePowerOf.AI projects.
                  </p>
                  <p className="text-sm italic">
                    Have thoughts or ideas? Tell us! This space is built for curious minds like yours, 
                    and we want to keep shaping it together.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSignUp} className="flex-1" size="lg">
              Create Account
            </Button>
            <Button onClick={handleNewsletter} variant="outline" className="flex-1" size="lg">
              Subscribe to Newsletter
            </Button>
          </div>

          <button
            onClick={handleClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
