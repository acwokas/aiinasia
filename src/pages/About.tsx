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
            AI in Asia is the leading platform for artificial intelligence news, insights, and education across Asia.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Our Mission</h2>
          <p>
            We empower Asia's builders, innovators, and decision-makers with timely, accurate, and actionable AI intelligence. From breakthrough research to practical applications, we cover the stories that matter.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">What We Cover</h2>
          <ul className="space-y-2">
            <li>Breaking AI news and developments across Asia</li>
            <li>In-depth features on AI strategy, policy, and implementation</li>
            <li>Interviews with leading AI researchers and entrepreneurs</li>
            <li>Practical guides and tools for AI adoption</li>
            <li>Educational resources through AI Academy</li>
          </ul>
          
          <h2 className="headline text-3xl mt-8 mb-4">Our Network</h2>
          <p>
            AI in Asia is part of an integrated ecosystem including PromptAndGo.ai (prompt engineering tools), BusinessInAByte.com (AI for business), and AIAcademy.asia (structured learning).
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
