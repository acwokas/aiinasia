import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StockTicker from "@/components/StockTicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrendingUp, Users, Calendar, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PromptAndGoBanner } from "@/components/PromptAndGoBanner";
import { BusinessInAByteAd } from "@/components/BusinessInAByteAd";

const Index = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: featuredArticle } = useQuery({
    queryKey: ["featured-article"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug),
          categories:primary_category_id (name)
        `)
        .eq("status", "published")
        .eq("featured_on_homepage", true)
        .order("sticky", { ascending: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: trendingArticles } = useQuery({
    queryKey: ["trending-articles"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      // Get articles with significant view counts, sorted purely by engagement
      const { data: topViewed, error: topError } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug),
          categories:primary_category_id (name)
        `)
        .eq("status", "published")
        .gte("view_count", 5)
        .order("view_count", { ascending: false })
        .limit(7);
      
      if (topError) throw topError;
      
      const minArticles = 5;
      
      // If we have enough articles, return them
      if (topViewed && topViewed.length >= minArticles) {
        return topViewed.slice(0, 5);
      }
      
      // Otherwise, backfill with random articles from past 10 weeks
      const tenWeeksAgo = new Date();
      tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70);
      
      const { data: recentArticles, error: recentError } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug),
          categories:primary_category_id (name)
        `)
        .eq("status", "published")
        .gte("published_at", tenWeeksAgo.toISOString())
        .order("published_at", { ascending: false })
        .limit(20);
      
      if (recentError) throw recentError;
      
      // Combine and deduplicate
      const combined = [...(topViewed || [])];
      const existingIds = new Set(combined.map(a => a.id));
      
      // Shuffle recent articles for randomness
      const shuffled = (recentArticles || [])
        .filter(a => !existingIds.has(a.id))
        .sort(() => Math.random() - 0.5);
      
      // Add random articles until we have 5
      for (const article of shuffled) {
        if (combined.length >= minArticles) break;
        combined.push(article);
      }
      
      return combined.slice(0, 5);
    },
  });

  const { data: latestArticles, isLoading } = useQuery({
    queryKey: ["latest-articles"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      // First get sticky articles
      const { data: stickyArticles, error: stickyError } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug),
          categories:primary_category_id (name)
        `)
        .eq("status", "published")
        .eq("sticky", true)
        .eq("featured_on_homepage", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(3);
      
      if (stickyError) throw stickyError;
      
      // Then get remaining articles to fill up to 12
      const stickyIds = (stickyArticles || []).map(a => a.id);
      const remainingCount = 12 - (stickyArticles?.length || 0);
      
      if (remainingCount > 0) {
        const query = supabase
          .from("articles")
          .select(`
            *,
            authors (name, slug),
            categories:primary_category_id (name)
          `)
          .eq("status", "published")
          .eq("featured_on_homepage", true)
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(remainingCount);
        
        // Exclude sticky articles if we have any
        if (stickyIds.length > 0) {
          query.not('id', 'in', `(${stickyIds.join(',')})`);
        }
        
        const { data: regularArticles, error: regularError } = await query;
        
        if (regularError) throw regularError;
        
        // Combine sticky articles at the top with regular articles
        return [...(stickyArticles || []), ...(regularArticles || [])];
      }
      
      return stickyArticles || [];
    },
  });

  const { data: featuredAuthors } = useQuery({
    queryKey: ["featured-authors"],
    staleTime: 10 * 60 * 1000, // 10 minutes
    queryFn: async () => {
      // Fetch Intelligence Desk author
      const { data: intelligenceDesk, error: idError } = await supabase
        .from("authors")
        .select("*")
        .eq("slug", "intelligence-desk")
        .single();
      
      if (idError && idError.code !== 'PGRST116') throw idError;
      
      // Fetch other top authors
      const query = supabase
        .from("authors")
        .select("*")
        .order("article_count", { ascending: false })
        .limit(intelligenceDesk ? 5 : 4);
      
      // Exclude Intelligence Desk from main query if found
      if (intelligenceDesk) {
        query.neq("slug", "intelligence-desk");
      }
      
      const { data: otherAuthors, error } = await query;
      
      if (error) throw error;
      
      // Arrange authors: first 3 from top authors, Intelligence Desk as 4th
      const result = [];
      const authors = otherAuthors || [];
      
      // Add first 3 top authors
      result.push(...authors.slice(0, 3));
      
      // Add Intelligence Desk as 4th if available
      if (intelligenceDesk) {
        result.push(intelligenceDesk);
      } else {
        // If Intelligence Desk not found, just use the 4th author
        if (authors[3]) result.push(authors[3]);
      }
      
      return result;
    },
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["upcoming-events"],
    staleTime: 10 * 60 * 1000, // 10 minutes
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "upcoming")
        .order("start_date", { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime event updates
  useEffect(() => {
    const channel = supabase
      .channel('homepage-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          // Refetch events when there's a change
          queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      <StockTicker />
      
      <main className="flex-1">
        {/* Hero Grid Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Trending Section - Left */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold uppercase mb-6">
                Trending
              </div>
              <div className="space-y-4">
              {(() => {
                const filteredTrending = trendingArticles?.filter((article: any) => article.slug) || [];
                const leftColumnCount = Math.min(5, filteredTrending.length);
                
                return filteredTrending.slice(0, leftColumnCount).map((article: any, index: number) => (
                <Link 
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="block group"
                >
                  <div className={`relative ${index === 0 ? 'aspect-video' : 'aspect-[16/9]'} overflow-hidden rounded-lg mb-2`}>
                    <img 
                      src={article.featured_image_url || "/placeholder.svg"} 
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                      {article.categories?.name || "Uncategorized"}
                    </Badge>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-white text-xs mb-1">{article.categories?.name || "Uncategorized"} | {article.reading_time_minutes || 5} min read</p>
                        <h3 className="text-white font-bold text-base line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                      </div>
                    )}
                  </div>
                  {index > 0 && (
                    <>
                      <p className="text-xs text-muted-foreground mb-1">
                        {article.categories?.name || "Uncategorized"} | {article.reading_time_minutes || 5} min read
                      </p>
                      <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                    </>
                  )}
                </Link>
                ));
              })()}
              </div>
            </div>

            {/* Featured Article - Center */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              {/* Large Featured Article */}
              {featuredArticle && featuredArticle.slug ? (
                <Link to={`/article/${featuredArticle.slug}`} className="block group">
                  <div className="relative h-[600px] overflow-hidden rounded-lg">
                    <img 
                      src={featuredArticle.featured_image_url || "/placeholder.svg"} 
                      alt={featuredArticle.title}
                      loading="eager"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <Badge className="bg-primary text-primary-foreground mb-3">
                        {featuredArticle.categories?.name || "Uncategorized"}
                      </Badge>
                      <h2 className="text-white font-bold text-3xl md:text-4xl mb-4 line-clamp-3 group-hover:text-primary transition-colors">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-white/90 text-base line-clamp-3">
                        {featuredArticle.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                trendingArticles?.[0]?.slug && (
                  <Link to={`/article/${trendingArticles[0].slug}`} className="block group">
                    <div className="relative h-[600px] overflow-hidden rounded-lg">
                      <img 
                        src={trendingArticles[0].featured_image_url || "/placeholder.svg"} 
                        alt={trendingArticles[0].title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <Badge className="bg-primary text-primary-foreground mb-3">
                          {trendingArticles[0].categories?.name || "Uncategorized"}
                        </Badge>
                        <h2 className="text-white font-bold text-3xl md:text-4xl mb-4 line-clamp-3 group-hover:text-primary transition-colors">
                          {trendingArticles[0].title}
                        </h2>
                        <p className="text-white/90 text-base line-clamp-3">
                          {trendingArticles[0].excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              )}

              {/* Two Medium Articles Stacked */}
              <div className="space-y-6">
                {latestArticles?.filter((article: any) => 
                  article.slug && article.id !== featuredArticle?.id
                ).slice(0, 2).map((article: any) => (
                  <Link 
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="block group"
                  >
                    <div className="relative h-[280px] overflow-hidden rounded-lg">
                      <img 
                        src={article.featured_image_url || "/placeholder.svg"} 
                        alt={article.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <Badge className="bg-primary text-primary-foreground text-xs mb-2">
                          {article.categories?.name || "Uncategorized"}
                        </Badge>
                        <h3 className="text-white font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-white/80 text-sm line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Latest Articles - Right */}
            <div className="lg:col-span-3 order-3">
              {/* Advertisement Slot */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground text-center mb-2">Advertisement</p>
                <BusinessInAByteAd />
              </div>

              <div className="bg-secondary text-secondary-foreground px-3 py-1.5 mb-6">
                <div className="text-xs font-bold uppercase">
                  Latest
                </div>
              </div>
              <div className="space-y-4">
              {(() => {
                const filteredLatest = latestArticles?.filter((article: any) => article.slug) || [];
                const rightColumnCount = Math.min(8, filteredLatest.length);
                
                return filteredLatest.slice(0, rightColumnCount).map((article: any, index: number) => (
                  <Link 
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="block group"
                  >
                    {index < 2 ? (
                      // First 2 articles with larger images
                      <div>
                        <div className="relative aspect-video overflow-hidden rounded-lg mb-2">
                          <img 
                            src={article.featured_image_url || "/placeholder.svg"} 
                            alt={article.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs">
                            {article.categories?.name || "Uncategorized"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {article.categories?.name || "Uncategorized"} | {article.reading_time_minutes || 5} min read
                        </p>
                        <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                      </div>
                    ) : (
                      // Remaining articles with small thumbnails
                      <div className="flex gap-3">
                        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded">
                          <img 
                            src={article.featured_image_url || "/placeholder.svg"} 
                            alt={article.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">
                            {article.categories?.name || "Uncategorized"}
                          </p>
                          <h3 className="font-bold text-sm line-clamp-3 group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                        </div>
                      </div>
                    )}
                  </Link>
                ));
              })()}
              </div>
            </div>
          </div>
        </section>

        {/* Ad Banner */}
        <section className="container mx-auto px-4 py-8">
          <p className="text-sm text-muted-foreground text-center mb-2">Advertisement</p>
          <PromptAndGoBanner />
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
              { name: "Prompt with the power of AI.", desc: "Advanced prompt engineering platform", url: "https://www.promptandgo.ai", category: "Productivity" },
              { name: "Startup with the power of AI.", desc: "AI prompts and templates to supercharge your business", url: "https://www.businessinabyte.com", category: "Business" },
              { name: "Shop with the power of AI.", desc: "AI-curated deals from around the web", url: "https://www.myofferclub.com", category: "Retail" },
            ].map((tool, i) => (
              <div key={i} className="article-card p-6 relative">
                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground hover:bg-accent/90">
                  {tool.category}
                </Badge>
                <h3 className="font-semibold text-lg mb-3 pr-20">{tool.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tool.desc}</p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    Learn More
                    <ExternalLink className="w-4 h-4" />
                  </a>
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
              {featuredAuthors?.map((author) => (
                <Link 
                  key={author.id} 
                  to={`/author/${author.slug}`}
                  className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                >
                  {author.avatar_url ? (
                    <img 
                      src={author.avatar_url} 
                      alt={author.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-2 ring-primary"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4" />
                  )}
                  <h3 className="font-semibold mb-1">{author.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{author.job_title || "Contributor"}</p>
                  <p className="text-xs text-muted-foreground">{author.article_count || 0} articles</p>
                </Link>
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
            <Button variant="outline" asChild>
              <Link to="/events">Full Calendar</Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="article-card p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{format(new Date(event.start_date), 'dd MMM yyyy')}</span>
                      <span>•</span>
                      <span>{event.city}, {event.country}</span>
                    </div>
                  </div>
                  {event.website_url ? (
                    <Button variant="outline" asChild>
                      <a href={event.website_url} target="_blank" rel="noopener noreferrer">
                        Learn More
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" asChild>
                      <Link to="/events">View Details</Link>
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="article-card p-6 text-center text-muted-foreground">
                No upcoming events at the moment. Check back soon!
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section id="newsletter" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-4xl font-bold mb-4">
              Never Miss an AI Breakthrough
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join 10,000+ professionals getting the AI in ASIA Brief every week.
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
