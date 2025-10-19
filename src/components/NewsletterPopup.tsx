import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

const NewsletterPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already seen/dismissed popup
    const hasSeenPopup = localStorage.getItem("newsletter-popup-seen");
    if (hasSeenPopup) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("newsletter-popup-seen", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate email
      const validatedEmail = emailSchema.parse(email);

      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email: validatedEmail }]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already subscribed",
            description: "This email is already on our list.",
          });
        } else {
          throw error;
        }
      } else {
        // Award newsletter badge and points if logged in
        if (user) {
          await supabase.rpc('award_points', { 
            _user_id: user.id, 
            _points: 25 
          });
          
          // Award Newsletter Insider achievement
          const { data: achievement } = await supabase
            .from('achievements')
            .select('id')
            .eq('name', 'Newsletter Insider')
            .single();
          
          if (achievement) {
            // Check if already earned
            const { data: existing } = await supabase
              .from('user_achievements')
              .select('id')
              .eq('user_id', user.id)
              .eq('achievement_id', achievement.id)
              .maybeSingle();
            
            if (!existing) {
              await supabase
                .from('user_achievements')
                .insert({ 
                  user_id: user.id, 
                  achievement_id: achievement.id 
                });
            }
          }

          toast({
            title: "Successfully subscribed!",
            description: "You earned 25 points and the Newsletter Insider badge! 🎉",
          });
        } else {
          toast({
            title: "Successfully subscribed!",
            description: "Check your inbox for a confirmation email.",
          });
        }
        handleClose();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription failed",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={handleClose}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Your email address"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            required
          />
          <Button className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Subscribing..." : "Subscribe Now"}
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
