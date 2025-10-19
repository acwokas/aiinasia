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

const Privacy = () => {
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
              <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <h1 className="headline text-4xl md:text-5xl mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: 16 October 2025</p>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <h2 className="headline text-3xl mt-8 mb-4">Introduction</h2>
          <p>
            AI in Asia ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Information We Collect</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">Information You Provide</h3>
          <ul className="space-y-2">
            <li>Email address (when subscribing to our newsletter)</li>
            <li>Name and contact details (when submitting forms)</li>
            <li>Comments and feedback</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Automatically Collected Information</h3>
          <ul className="space-y-2">
            <li>Browser type and version</li>
            <li>IP address</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
          </ul>
          
          <h2 className="headline text-3xl mt-8 mb-4">How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="space-y-2">
            <li>Deliver newsletter content and updates</li>
            <li>Respond to your enquiries and comments</li>
            <li>Improve our website and services</li>
            <li>Analyse usage patterns and trends</li>
            <li>Comply with legal obligations</li>
          </ul>
          
          <h2 className="headline text-3xl mt-8 mb-4">Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your browser settings. For more details, see our <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a>.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="space-y-2">
            <li><strong>Google Analytics:</strong> For website analytics</li>
            <li><strong>Google Ads:</strong> For advertising</li>
            <li><strong>Email Service Providers:</strong> For newsletter delivery</li>
          </ul>
          
          <h2 className="headline text-3xl mt-8 mb-4">Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
          
          <h2 className="headline text-3xl mt-8 mb-4">Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under 16. We do not knowingly collect personal information from children.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.
          </p>
          
          <h2 className="headline text-3xl mt-8 mb-4">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@aiinasia.com" className="text-primary hover:underline">privacy@aiinasia.com</a>.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
