import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Comments from "@/components/Comments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Share2, Bookmark, Twitter, Linkedin, Facebook } from "lucide-react";
import heroImage from "@/assets/hero-ai-networks.jpg";

const Article = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary">Home</a>
            <span className="mx-2">›</span>
            <a href="/features" className="hover:text-primary">Features</a>
            <span className="mx-2">›</span>
            <span>Article</span>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <Badge className="mb-4 bg-primary text-primary-foreground">Feature</Badge>
            
            <h1 className="headline text-4xl md:text-5xl mb-4">
              How Singapore's AI Strategy is Reshaping Southeast Asia's Tech Landscape
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              An in-depth look at Singapore's National AI Strategy 2.0 and its ripple effects across the region, from startups to government initiatives.
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary" />
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <User className="h-4 w-4" />
                    Dr. Sarah Chen
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    8 min read • 15 January 2025
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Hero Image */}
          <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
            <img 
              src={heroImage} 
              alt="AI networks visualization"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed mb-6">
              Singapore has long positioned itself as a hub for technology and innovation in Southeast Asia. With the launch of its National AI Strategy 2.0, the city-state is doubling down on artificial intelligence as a key driver of economic growth and societal advancement.
            </p>

            <h2 className="headline text-3xl mt-8 mb-4">The Strategic Vision</h2>
            
            <p className="leading-relaxed mb-6">
              The strategy focuses on three main pillars: developing AI capabilities, deploying AI solutions at scale, and fostering international collaboration. Unlike many Western approaches that prioritize market competition, Singapore's model emphasizes public-private partnerships and regional cooperation.
            </p>

            {/* Ad Placement */}
            <div className="my-8 bg-muted border border-border rounded-lg p-8 text-center not-prose">
              <p className="text-sm text-muted-foreground mb-2">Advertisement</p>
              <p className="text-muted-foreground">In-article Ad Placement (300 × 250)</p>
            </div>

            <h2 className="headline text-3xl mt-8 mb-4">Impact Across the Region</h2>
            
            <p className="leading-relaxed mb-6">
              The ripple effects of Singapore's AI push are already being felt across Southeast Asia. Malaysia, Thailand, and Indonesia have all announced similar initiatives, creating a competitive yet collaborative regional ecosystem.
            </p>

            <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-xl">
              "Singapore's approach to AI governance provides a blueprint that balances innovation with responsibility - something the entire region can learn from."
            </blockquote>

            <h2 className="headline text-3xl mt-8 mb-4">Challenges and Opportunities</h2>
            
            <p className="leading-relaxed mb-6">
              While the strategy is ambitious, challenges remain. Talent shortage continues to be a critical issue, with the demand for AI specialists far outstripping supply. Additionally, questions around data privacy, algorithmic bias, and ethical AI deployment require ongoing attention.
            </p>

            <p className="leading-relaxed mb-6">
              However, opportunities abound. The focus on AI solutions for healthcare, urban planning, and education addresses real societal needs while creating commercial opportunities for startups and established companies alike.
            </p>

            <h2 className="headline text-3xl mt-8 mb-4">Looking Ahead</h2>
            
            <p className="leading-relaxed mb-6">
              As we move further into 2025, Singapore's AI Strategy 2.0 will serve as a crucial test case for how smaller nations can compete in the global AI race. Success here could provide a model for other regions seeking to harness AI's transformative potential while managing its risks.
            </p>
          </div>

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-semibold text-lg">Share this article</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Facebook className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Dr. Sarah Chen</h4>
                <p className="text-sm text-muted-foreground">
                  Dr. Chen is a senior researcher at the National University of Singapore, specializing in AI policy and governance. She has published extensively on technology adoption in Southeast Asia.
                </p>
              </div>
            </div>
          </footer>

          {/* Comments Section */}
          <Comments articleId="sample-article-id" />
        </article>

        {/* Related Articles */}
        <section className="bg-muted/30 py-12 mt-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="headline text-3xl mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      Related Article Title {i}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Brief description of the related article content.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Article;
