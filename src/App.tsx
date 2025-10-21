import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Article from "./pages/Article";
import Category from "./pages/Category";
import Tag from "./pages/Tag";
import AuthorProfile from "./pages/AuthorProfile";
import SitemapRedirect from "./pages/SitemapRedirect";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Articles from "./pages/Articles";
import Editor from "./pages/Editor";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";
import Redirects from "./pages/Redirects";
import BulkImport from "./pages/BulkImport";
import ImageMigration from "./pages/ImageMigration";
import ExtractImageUrls from "./pages/ExtractImageUrls";
import UpdateArticleImages from "./pages/UpdateArticleImages";
import MigrationDashboard from "./pages/MigrationDashboard";
import BulkRedirects from "./pages/BulkRedirects";
import MigrateCategoryUrls from "./pages/MigrateCategoryUrls";
import ContentProcessor from "./pages/ContentProcessor";
import CategoryMapper from "./pages/CategoryMapper";
import CleanArticles from "./pages/CleanArticles";
import PublishAllArticles from "./pages/PublishAllArticles";
import BulkCommentGeneration from "./pages/BulkCommentGeneration";
import GenerateTldrBulk from "./pages/GenerateTldrBulk";
import AssignCategories from "./pages/AssignCategories";
import FixBrokenImage from "./pages/FixBrokenImage";
import NotFound from "./pages/NotFound";
import Events from "./pages/Events";
import Newsletter from "./pages/Newsletter";
import NewsletterPopup from "./components/NewsletterPopup";
import ScoutChatbot from "./components/ScoutChatbot";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { loadGoogleAdsScript } from "./components/GoogleAds";
import ConsentBanner from "./components/ConsentBanner";
import { CollectiveFooter } from "./components/CollectiveFooter";

loadGoogleAdsScript();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GoogleAnalytics />
          <ConsentBanner />
          <NewsletterPopup />
          <ScoutChatbot />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/:category/:slug" element={<Article />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/tag/:slug" element={<Tag />} />
          <Route path="/author/:slug" element={<AuthorProfile />} />
          <Route path="/sitemap.xml" element={<SitemapRedirect />} />
            <Route path="/search" element={<Search />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/articles" element={<Articles />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:id" element={<Editor />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/events" element={<Events />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/redirects" element={<Redirects />} />
            <Route path="/admin/bulk-import" element={<BulkImport />} />
            <Route path="/admin/extract-image-urls" element={<ExtractImageUrls />} />
            <Route path="/admin/image-migration" element={<ImageMigration />} />
            <Route path="/admin/update-article-images" element={<UpdateArticleImages />} />
            <Route path="/admin/migration-dashboard" element={<MigrationDashboard />} />
            <Route path="/admin/bulk-redirects" element={<BulkRedirects />} />
            <Route path="/admin/migrate-category-urls" element={<MigrateCategoryUrls />} />
            <Route path="/admin/content-processor" element={<ContentProcessor />} />
            <Route path="/admin/category-mapper" element={<CategoryMapper />} />
            <Route path="/admin/clean-articles" element={<CleanArticles />} />
            <Route path="/admin/publish-all" element={<PublishAllArticles />} />
            <Route path="/admin/bulk-comments" element={<BulkCommentGeneration />} />
           <Route path="/admin/generate-tldr" element={<GenerateTldrBulk />} />
          <Route path="/admin/assign-categories" element={<AssignCategories />} />
            <Route path="/admin/fix-broken-image" element={<FixBrokenImage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CollectiveFooter />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
