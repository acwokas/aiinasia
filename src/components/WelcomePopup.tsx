import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const WelcomePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

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
              Welcome to the New AI in Asia!
            </h2>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-3">
              <p>
                We're thrilled to welcome you to our completely redesigned and upgraded website! 
                AI in Asia is now proudly part of the <strong>You.WithThePowerOf.AI Collective</strong>, 
                bringing you even more insights, resources, and community.
              </p>
              <p>
                <strong>Thank you</strong> for being part of our journey and coming back to explore 
                what's new. Your support means everything to us!
              </p>
              <p>
                🎁 <strong>New feature:</strong> Sign up for an account to earn awards that can be 
                used across the entire You.WithThePowerOf.AI ecosystem!
              </p>
              <p className="text-sm italic">
                Have ideas or feedback? We'd love to hear from you – this is your community, 
                and we want to make it the best it can be!
              </p>
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
