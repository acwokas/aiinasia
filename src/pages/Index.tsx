import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-ai-networks.jpg";
import featureImage from "@/assets/feature-ai-team.jpg";
import roboticsImage from "@/assets/robotics-lab.jpg";
import mlImage from "@/assets/ml-visualization.jpg";

const Index = () => {
  const topStories = [
    {
      title: "How Singapore's AI Strategy is Reshaping Southeast Asia's Tech Landscape",
      excerpt: "An in-depth look at Singapore's National AI Strategy 2.0 and its ripple effects across the region, from startups to government initiatives.",
      category: "Feature",
      author: "Dr. Sarah Chen",
      readTime: "8 min read",
      image: heroImage,
      featured: true,
    },
    {
      title: "China's Latest AI Regulations: What They Mean for Innovation",
      excerpt: "New guidelines aim to balance innovation with control in the world's fastest-growing AI market.",
      category: "News",
      author: "Michael Wong",
      readTime: "5 min read",
      image: featureImage,
    },
    {
      title: "Inside Japan's Robotics Revolution",
      excerpt: "How Japanese companies are leading the next wave of AI-powered robotics for healthcare and elderly care.",
      category: "Feature",
      author: "Yuki Tanaka",
      readTime: "10 min read",
      image: roboticsImage,
    },
    {
      title: "India's AI Talent Exodus: Opportunities or Crisis?",
      excerpt: "As Indian AI professionals move to global tech hubs, what does this mean for the domestic AI ecosystem?",
      category: "Opinion",
      author: "Priya Sharma",
      readTime: "6 min read",
      image: mlImage,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topStories.map((story, index) => (
              <ArticleCard key={index} {...story} />
            ))}
          </div>
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
              {[
                { name: "Dr. Li Wei", title: "AI Ethics Researcher", articles: 24 },
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
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-4xl font-bold mb-4">
              Never Miss an AI Breakthrough
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join 10,000+ professionals getting the AI in Asia Brief every week.
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-lg text-foreground"
              />
              <Button variant="secondary" size="lg">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
