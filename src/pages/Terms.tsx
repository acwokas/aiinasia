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

const Terms = () => {
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
              <BreadcrumbPage>Terms of Service</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <h1 className="headline text-4xl md:text-5xl mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: 16 October 2025</p>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <h2 className="headline text-3xl mt-8 mb-4">Agreement to Terms</h2>
          <p>
            By accessing or using AI in ASIA, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Intellectual Property</h2>
          <p>
            All content on AI in ASIA, including text, graphics, logos, images, and software, is the property of AI in ASIA or its content suppliers and is protected by international copyright laws.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Permitted Use</h3>
          <p>You may:</p>
          <ul className="space-y-2">
            <li>View and read content for personal, non-commercial use</li>
            <li>Share links to our articles on social media</li>
            <li>Quote brief excerpts with proper attribution</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Prohibited Use</h3>
          <p>You may not:</p>
          <ul className="space-y-2">
            <li>Reproduce, distribute, or republish our content without permission</li>
            <li>Use our content for commercial purposes without authorisation</li>
            <li>Remove copyright or attribution notices</li>
            <li>Use automated systems to scrape or harvest content</li>
          </ul>
          
          <h2 className="headline text-3xl mt-8 mb-4">User Content</h2>
          <p>
            When you submit comments, feedback, or other content to AI in ASIA, you grant us a non-exclusive, worldwide, royalty-free licence to use, reproduce, and publish such content.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Disclaimer of Warranties</h2>
          <p>
            AI in ASIA is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or free from viruses or other harmful components.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Limitation of Liability</h2>
          <p>
            In no event shall AI in ASIA be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the service.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">External Links</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible for the content, privacy practices, or terms of service of any linked sites.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Advertising</h2>
          <p>
            We display advertisements through Google Ads and may feature sponsored content. Sponsored content will be clearly labelled. We are not responsible for the accuracy or claims made in advertisements.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Modification of Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of the service constitutes acceptance of the modified terms.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Singapore, without regard to its conflict of law provisions.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at <a href="mailto:legal@aiinasia.com" className="text-primary hover:underline">legal@aiinasia.com</a>.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
