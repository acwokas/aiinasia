import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Users, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: topStories, isLoading } = useQuery({
    queryKey: ["homepage-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug),
          categories:primary_category_id (name)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: featuredAuthor } = useQuery({
    queryKey: ["featured-author"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("authors")
        .select("*")
        .order("article_count", { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email: newsletterEmail }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      setNewsletterEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topStories?.map((article: any) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                excerpt={article.excerpt || ""}
                category={article.categories?.name || ""}
                author={article.authors?.name || ""}
                readTime={`${article.reading_time_minutes || 5} min read`}
                image={article.featured_image_url || ""}
                slug={article.slug}
                featured={article.featured_on_homepage}
              />
            ))}
          </div>
          {(!topStories || topStories.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles published yet.</p>
            </div>
          )}
        </section>

        {/* Ad Banner */}
        <section className="container mx-auto px-4 py-4">
          <div className="bg-muted border border-border rounded-lg p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Advertisement</p>
            <p className="text-muted-foreground">728 × 90 Banner Placement</p>
          </div>
        </section>

        {/* Trending Tools Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="headline text-3xl flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Trending AI Tools
            </h2>
            <Button variant="outline">View All Tools</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "PromptCraft AI", desc: "Advanced prompt engineering platform", category: "Productivity" },
              { name: "DataViz Pro", desc: "AI-powered data visualization suite", category: "Analytics" },
              { name: "CodeAssist", desc: "Intelligent code completion for developers", category: "Development" },
            ].map((tool, i) => (
              <div key={i} className="article-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{tool.name}</h3>
                  <span className="category-badge bg-secondary text-secondary-foreground">
                    {tool.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{tool.desc}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Voices Section */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="headline text-3xl flex items-center gap-2">
                <Users className="h-8 w-8 text-secondary" />
                Featured Voices
              </h2>
              <Button variant="outline">All Contributors</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {featuredAuthor && (
                <Link to={`/author/${featuredAuthor.slug}`} className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  {featuredAuthor.avatar_url ? (
                    <img 
                      src={featuredAuthor.avatar_url} 
                      alt={featuredAuthor.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-2 ring-primary"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4" />
                  )}
                  <h3 className="font-semibold mb-1">{featuredAuthor.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{featuredAuthor.job_title}</p>
                  <p className="text-xs text-muted-foreground">{featuredAuthor.article_count} articles</p>
                </Link>
              )}
              {[
                { name: "Aisha Rahman", title: "ML Engineer", articles: 18 },
                { name: "Kenji Sato", title: "Robotics Expert", articles: 31 },
                { name: "Maya Patel", title: "Tech Journalist", articles: 42 },
              ].map((author, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4" />
                  <h3 className="font-semibold mb-1">{author.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{author.title}</p>
                  <p className="text-xs text-muted-foreground">{author.articles} articles</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="headline text-3xl flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              Upcoming Events
            </h2>
            <Button variant="outline">Full Calendar</Button>
          </div>
          
          <div className="space-y-4">
            {[
              { title: "AI Summit Asia 2025", date: "15-17 March", location: "Singapore" },
              { title: "Neural Networks Workshop", date: "22 March", location: "Virtual" },
              { title: "Ethics in AI Symposium", date: "5-6 April", location: "Tokyo" },
            ].map((event, i) => (
              <div key={i} className="article-card p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.location}</span>
                  </div>
                </div>
                <Button variant="outline">Register</Button>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section id="newsletter" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-4xl font-bold mb-4">
              Never Miss an AI Breakthrough
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join 10,000+ professionals getting the AI in Asia Brief every week.
            </p>
            <form onSubmit={handleNewsletterSignup} className="flex gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="flex-1 bg-white text-foreground"
              />
              <Button type="submit" variant="secondary" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
