import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NewsletterPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show popup after 10 seconds (in real app, check if user hasn't subscribed)
  useState(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);
    return () => clearTimeout(timer);
  });

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center mb-6">
          <h2 className="font-serif text-3xl font-bold mb-2">
            Join <span className="text-primary">10,000+</span> AI Builders
          </h2>
          <p className="text-muted-foreground">
            Get the AI in Asia Brief - weekly insights on AI innovation across Asia.
          </p>
        </div>

        <form className="space-y-4">
          <Input
            type="email"
            placeholder="Your email address"
            className="w-full"
          />
          <Button className="w-full" size="lg">
            Subscribe Now
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </form>
      </div>
    </div>
  );
};

export default NewsletterPopup;
