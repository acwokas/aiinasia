import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="headline text-4xl md:text-5xl mb-6">About AI in Asia</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-xl text-muted-foreground">
            AI in Asia is the leading platform for artificial intelligence news, insights, and education across Asia, powered by you.withthepowerof.ai.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">The Power of AI for Everyone</h2>
          <p>
            <strong>you.withthepowerof.ai</strong> is our parent organization dedicated to democratizing artificial intelligence. We believe that AI shouldn't be confined to tech giants and research labs—it should empower individuals, businesses, and communities worldwide to achieve more.
          </p>
          <p>
            Our mission is to make AI accessible, understandable, and actionable for everyone. We bridge the gap between cutting-edge AI innovation and practical implementation through education, tools, and trusted journalism.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">AIinASIA's Mission</h2>
          <p>
            As the news and insights arm of you.withthepowerof.ai, AI in Asia empowers the region's builders, innovators, and decision-makers with timely, accurate, and actionable AI intelligence. From breakthrough research to practical applications, we cover the stories that matter most to Asia's rapidly evolving AI landscape.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">What We Cover</h2>
          <ul className="space-y-2">
            <li>Breaking AI news and developments across Asia</li>
            <li>In-depth features on AI strategy, policy, and implementation</li>
            <li>Interviews with leading AI researchers and entrepreneurs</li>
            <li>Practical guides and tools for AI adoption</li>
            <li>Educational resources through AI Academy</li>
            <li>Regional AI trends and their global implications</li>
          </ul>
          
          <h2 className="headline text-3xl mt-8 mb-4">Our Ecosystem</h2>
          <p>
            AI in Asia is part of the <strong>you.withthepowerof.ai</strong> integrated ecosystem:
          </p>
          <ul className="space-y-2">
            <li><strong>AIinASIA.com</strong> – Trusted AI news, insights, and analysis</li>
            <li><strong>PromptAndGo.ai</strong> – Prompt engineering tools and resources</li>
            <li><strong>BusinessInAByte.com</strong> – AI strategies for business leaders</li>
            <li><strong>AIAcademy.asia</strong> – Structured learning and certification programs</li>
          </ul>
          <p className="mt-4">
            Together, these platforms form a comprehensive support system for anyone looking to understand, implement, or excel with AI technology.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Editorial Standards</h2>
          <p>
            We maintain strict editorial independence and transparency. Our content is researched, fact-checked, and written to the highest journalistic standards. Where AI assists in our editorial process, we clearly disclose it.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-8 mt-12">
            <h3 className="font-semibold text-xl mb-4">Get In Touch</h3>
            <p>
              Have a story tip, partnership enquiry, or feedback? <a href="/contact" className="text-primary hover:underline">Contact us</a>.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
