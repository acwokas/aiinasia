import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>About</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <h1 className="headline text-4xl md:text-5xl mb-6">About AI in ASIA</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-xl text-muted-foreground">
            AI in ASIA is the leading platform for artificial intelligence news, insights, and education across Asia, powered by you.withthepowerof.ai.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">The Power of AI for Everyone</h2>
          <p>
            <strong>you.withthepowerof.ai</strong> is our parent organization dedicated to democratizing artificial intelligence. We believe that AI shouldn't be confined to tech giants and research labs—it should empower individuals, businesses, and communities worldwide to achieve more.
          </p>
          <p>
            Our mission is to make AI accessible, understandable, and actionable for everyone. We bridge the gap between cutting-edge AI innovation and practical implementation through education, tools, and trusted journalism.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">AI in ASIA's Mission</h2>
          <p>
            As the news and insights arm of you.withthepowerof.ai, AI in ASIA empowers the region's builders, innovators, and decision-makers with timely, accurate, and actionable AI intelligence. From breakthrough research to practical applications, we cover the stories that matter most to Asia's rapidly evolving AI landscape.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">What We Cover</h2>
          <ul className="space-y-2">
            <li>Breaking AI news and developments across Asia</li>
            <li>In-depth features on AI strategy, policy, and implementation</li>
            <li>Interviews with leading AI researchers and entrepreneurs</li>
            <li>Practical guides and tools for AI adoption</li>
            <li>Educational resources through AI Academy</li>
            <li>Regional AI trends and their global implications</li>
            <li>Live AI events, conferences, and community meetups</li>
            <li>Creator tools and resources for AI content generation</li>
          </ul>
          
          <h2 className="headline text-3xl mt-8 mb-4">Gamification & Rewards 🎯</h2>
          <p>
            At AI in ASIA, we believe learning about AI should be engaging and rewarding. That's why we've built a comprehensive points and achievement system that recognizes your engagement and unlocks exclusive benefits.
          </p>
          
          <h3 className="font-semibold text-xl mt-6 mb-3">How to Earn Points</h3>
          <ul className="space-y-2">
            <li><strong>Sign Up (20-50+ points)</strong> – Create your account and complete your profile to earn bonus points</li>
            <li><strong>Read Articles (5 points)</strong> – Stay informed and earn points for every article you read</li>
            <li><strong>Subscribe to Newsletter (25 points)</strong> – Never miss important AI news and earn the Newsletter Insider badge</li>
            <li><strong>Complete Your Profile</strong> – Add your interests, company details, and profile picture for extra points</li>
            <li><strong>Engage with Content</strong> – Comment, share, and participate in the community</li>
          </ul>
          
          <h3 className="font-semibold text-xl mt-6 mb-3">Unlock Exclusive Benefits</h3>
          <p>
            As you accumulate points, you'll progress through member levels and unlock increasingly valuable benefits:
          </p>
          
          <div className="bg-muted/50 rounded-lg p-6 my-6 space-y-4">
            <div>
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🌟 Explorer (0-99 points)</h4>
              <p className="text-sm">Basic Scout AI assistant access, article bookmarks, and personalized news feed</p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">⚡ Enthusiast (100-499 points)</h4>
              <p className="text-sm">Enhanced Scout AI queries, early access to select content, and exclusive newsletter segments</p>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">🏆 Expert (500-999 points)</h4>
              <p className="text-sm">Premium Scout AI capabilities, access to member-only articles, special partner offers, and priority event registration</p>
            </div>
            <div>
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">👑 Thought Leader (1000+ points)</h4>
              <p className="text-sm">Unlimited Scout AI queries, all premium content access, VIP partner benefits, exclusive industry insights, and recognition in our community</p>
            </div>
          </div>
          
          <h3 className="font-semibold text-xl mt-6 mb-3">Scout AI Assistant 🤖</h3>
          <p>
            Scout is your personal AI research assistant, available 24/7 to help you understand AI trends, research topics, and get instant answers to your questions. Scout's capabilities scale with your member level:
          </p>
          <ul className="space-y-2 mt-3">
            <li><strong>Explorer level</strong> – Basic queries and article summaries</li>
            <li><strong>Enthusiast level</strong> – Enhanced research and multi-source analysis</li>
            <li><strong>Expert level</strong> – Advanced insights and trend analysis</li>
            <li><strong>Thought Leader level</strong> – Unlimited queries with premium AI models and deep-dive research</li>
          </ul>
          
          <h3 className="font-semibold text-xl mt-6 mb-3">Partner Benefits & Premium Access</h3>
          <p>
            Your points don't just unlock features on AI in ASIA—they open doors across the entire <strong>you.withthepowerof.ai</strong> ecosystem:
          </p>
          <ul className="space-y-2 mt-3">
            <li><strong>PromptAndGo.ai</strong> – Discounted access to premium prompt templates and advanced tools</li>
            <li><strong>BusinessInAByte.com</strong> – Exclusive strategy reports and case studies</li>
            <li><strong>AI Academy</strong> – Course discounts and priority enrollment</li>
            <li><strong>Industry Partners</strong> – Special offers from leading AI tools and platforms</li>
            <li><strong>Premium Events</strong> – Free or discounted tickets to AI conferences and workshops</li>
          </ul>
          
          <h2 className="headline text-3xl mt-8 mb-4">Our Ecosystem</h2>
          <p>
            AI in ASIA is part of the <strong>you.withthepowerof.ai</strong> integrated ecosystem, where your engagement and learning journey is recognized across all platforms:
          </p>
          <ul className="space-y-2">
            <li><strong>AI in ASIA</strong> – Trusted AI news, insights, and analysis with gamified learning</li>
            <li><strong>PromptAndGo.ai</strong> – Prompt engineering tools and resources for practitioners</li>
            <li><strong>BusinessInAByte.com</strong> – AI strategies and implementation guides for business leaders</li>
            <li><strong>AIAcademy.asia</strong> – Structured learning paths and professional certification programs</li>
          </ul>
          <p className="mt-4">
            Together, these platforms form a comprehensive support system for anyone looking to understand, implement, or excel with AI technology—with rewards that grow as you do.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Editorial Standards</h2>
          <p>
            We maintain strict editorial independence and transparency. Our content is researched, fact-checked, and written to the highest journalistic standards. Where AI assists in our editorial process, including our Scout AI assistant, we clearly disclose it. Our gamification system is designed to reward engagement, not influence editorial decisions.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-8 mt-12">
            <h3 className="font-semibold text-xl mb-4">Get In Touch</h3>
            <p>
              Have a story tip, partnership enquiry, or feedback? <a href="/contact" className="text-primary hover:underline">Contact us</a>.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Part of the you.withthepowerof.ai family – Empowering everyone with accessible AI
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
