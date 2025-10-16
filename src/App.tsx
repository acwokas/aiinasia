import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Article from "./pages/Article";
import Category from "./pages/Category";
import Tag from "./pages/Tag";
import AuthorProfile from "./pages/AuthorProfile";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Editor from "./pages/Editor";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";
import Redirects from "./pages/Redirects";
import NotFound from "./pages/NotFound";
import NewsletterPopup from "./components/NewsletterPopup";
import AIChatbot from "./components/AIChatbot";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { loadGoogleAdsScript } from "./components/GoogleAds";
import ConsentBanner from "./components/ConsentBanner";

loadGoogleAdsScript();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GoogleAnalytics />
        <ConsentBanner />
        <NewsletterPopup />
        <AIChatbot />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/tag/:slug" element={<Tag />} />
          <Route path="/author/:slug" element={<AuthorProfile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:id" element={<Editor />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/redirects" element={<Redirects />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
