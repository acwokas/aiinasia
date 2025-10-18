import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Comments from "@/components/Comments";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Share2, Bookmark, Twitter, Linkedin, Facebook, Loader2, ExternalLink } from "lucide-react";
import { Helmet } from "react-helmet";

const Article = () => {
  const { slug } = useParams();
  // Remove trailing slashes from slug for consistent lookups
  const cleanSlug = slug?.replace(/\/+$/g, '');

  const handleShare = async () => {
    const shareData = {
      title: article?.title || '',
      text: article?.excerpt || '',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Could add a toast notification here
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", cleanSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug, bio, avatar_url, job_title),
          categories:primary_category_id (name, slug)
        `)
        .eq("slug", cleanSlug)
        .eq("status", "published")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ["related-articles", article?.primary_category_id, article?.id],
    enabled: !!article?.id,
    queryFn: async () => {
      // If article has a category, prioritize same category
      if (article?.primary_category_id) {
        const { data, error } = await supabase
          .from("articles")
          .select(`
            *,
            authors (name, slug),
            categories:primary_category_id (name)
          `)
          .eq("primary_category_id", article.primary_category_id)
          .neq("id", article.id)
          .eq("status", "published")
          .order("view_count", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(3);
        
        if (error) throw error;
        return data;
      }
      
      // Otherwise, just show recent popular articles
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug),
          categories:primary_category_id (name)
        `)
        .neq("id", article.id)
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  // Determine external link based on article category
  const getExternalLink = () => {
    const categoryName = article?.categories?.name?.toLowerCase() || '';
    
    if (categoryName.includes('ai') || categoryName.includes('machine learning')) {
      return {
        text: 'Try ChatGPT',
        url: 'https://chat.openai.com',
        icon: '🤖'
      };
    } else if (categoryName.includes('robotics')) {
      return {
        text: 'Try Gemini AI',
        url: 'https://gemini.google.com',
        icon: '✨'
      };
    } else {
      return {
        text: 'Explore Google Gemini',
        url: 'https://gemini.google.com',
        icon: '🚀'
      };
    }
  };

  const externalLink = article ? getExternalLink() : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/">Go to Homepage</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const renderContent = (content: any) => {
    if (!content) return null;
    
    // If content is a string (markdown), convert it to HTML with proper parsing
    if (typeof content === 'string') {
      // Consolidate ALL consecutive bullet points into single lists
      // Replace all double line breaks between bullets with single line breaks
      let consolidated = content.replace(/(- [^\n]+)\n\n(?=- )/g, '$1\n');
      
      // Process inline formatting FIRST (before splitting into blocks)
      let processed = consolidated
        // Convert actual bold text first
        .replace(/\*\*([^\*]+?)\*\*/g, '<strong>$1</strong>')
        // Convert italic text (single asterisks only, not part of **)
        .replace(/(?<!\*)\*([^\*]+?)\*(?!\*)/g, '<em>$1</em>')
        // Remove any remaining standalone ** markers (cleanup)
        .replace(/\*\*/g, '')
        // Convert links with new tab marker (^) - add external link icon (must come before regular links)
        .replace(/\[([^\]]+)\]\(([^)]+)\)\^/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:no-underline inline-flex items-center gap-1">$1<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline ml-0.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" x2="21" y1="14" y2="3"></line></svg></a>')
        // Convert regular links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>');
      
      // Split into blocks by double line breaks
      const blocks = processed.split('\n\n').map(block => block.trim()).filter(block => block.length > 0);
      
      // Process each block
      const htmlBlocks = blocks.map(block => {
        // Check for headings (must be at start of block)
        if (block.startsWith('### ')) {
          return `<h3 class="text-2xl font-semibold mt-8 mb-4">${block.substring(4)}</h3>`;
        }
        if (block.startsWith('## ')) {
          return `<h2 class="text-3xl font-bold mt-8 mb-4">${block.substring(3)}</h2>`;
        }
        if (block.startsWith('# ')) {
          return `<h1 class="text-4xl font-bold mt-8 mb-4">${block.substring(2)}</h1>`;
        }
        
        // Check for blockquotes
        if (block.startsWith('> ')) {
          return `<blockquote class="border-l-4 border-primary pl-6 py-2 my-8 italic text-xl">${block.substring(2)}</blockquote>`;
        }
        
        // Check for lists (multiple lines starting with -)
        if (block.includes('\n- ') || block.startsWith('- ')) {
          const items = block.split('\n')
            .filter(line => line.trim().startsWith('- '))
            .map(line => `<li class="leading-relaxed">${line.trim().substring(2)}</li>`)
            .join('');
          return `<ul class="list-disc ml-6 my-6">${items}</ul>`;
        }
        
        // Default to paragraph
        return `<p class="leading-relaxed mb-6">${block.replace(/\n/g, ' ')}</p>`;
      });
      
      return <div dangerouslySetInnerHTML={{ __html: htmlBlocks.join('\n') }} />;
    }
    
    // Otherwise try to parse as JSON blocks (legacy format)
    try {
      const blocks = typeof content === 'string' ? JSON.parse(content) : content;
      return blocks.map((block: any, index: number) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={index} className="leading-relaxed mb-6">{block.content}</p>;
          case 'heading':
            return <h2 key={index} className="headline text-3xl mt-8 mb-4">{block.content}</h2>;
          case 'quote':
            return (
              <blockquote key={index} className="border-l-4 border-primary pl-6 py-2 my-8 italic text-xl">
                {block.content}
              </blockquote>
            );
          case 'image':
            return (
              <div key={index} className="my-8">
                <img src={block.url} alt={block.alt || ''} className="w-full rounded-lg" />
                {block.caption && (
                  <p className="text-sm text-muted-foreground text-center mt-2">{block.caption}</p>
                )}
              </div>
            );
          default:
            return null;
        }
      });
    } catch (error) {
      return <p className="leading-relaxed mb-6">{content}</p>;
    }
  };

  return (
    <>
      <Helmet>
        <title>{article.meta_title || article.title} | AIinASIA</title>
        <meta name="description" content={article.meta_description || article.excerpt || ''} />
        <link rel="canonical" href={article.canonical_url || window.location.href} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <article className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Breadcrumbs */}
            <nav className="text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">›</span>
              {article.categories && (
                <>
                  <Link to={`/category/${article.categories.slug}`} className="hover:text-primary">
                    {article.categories.name}
                  </Link>
                  <span className="mx-2">›</span>
                </>
              )}
              <span>{article.title}</span>
            </nav>

            {/* Article Header */}
            <header className="mb-8">
              <Badge className="mb-4 bg-primary text-primary-foreground">
                {article.categories?.name || 'Article'}
              </Badge>
              
              <h1 className="headline text-4xl md:text-5xl mb-4">
                {article.title}
              </h1>
              
              {article.excerpt && (
                <p className="text-xl text-muted-foreground mb-6">
                  {article.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                  {article.authors?.slug ? (
                    <Link to={`/author/${article.authors.slug}`}>
                      {article.authors.avatar_url ? (
                        <img 
                          src={article.authors.avatar_url} 
                          alt={article.authors.name}
                          className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary hover:opacity-80 transition-opacity" />
                      )}
                    </Link>
                  ) : (
                    article.authors?.avatar_url ? (
                      <img 
                        src={article.authors.avatar_url} 
                        alt={article.authors?.name || 'Anonymous'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary" />
                    )
                  )}
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      <User className="h-4 w-4" />
                      {article.authors?.slug ? (
                        <Link to={`/author/${article.authors.slug}`} className="hover:text-primary transition-colors">
                          {article.authors.name}
                        </Link>
                      ) : (
                        article.authors?.name || 'Anonymous'
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {article.reading_time_minutes || 5} min read • 
                      {article.published_at && new Date(article.published_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Hero Image - Featured image displayed above article content */}
            {article.featured_image_url && (
              <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
                <img 
                  src={article.featured_image_url} 
                  alt={article.featured_image_alt || article.title}
                  className="w-full h-full object-cover"
                />
                {article.featured_image_caption && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {article.featured_image_caption}
                  </p>
                )}
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {renderContent(article.content)}
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
            </footer>

            {/* Comments Section */}
            <Comments articleId={article.id} />

            {/* Author Bio */}
            {article.authors && (
              <div className="bg-muted/50 rounded-lg p-8 flex flex-col md:flex-row items-center md:items-start gap-6 mt-8">
                {article.authors.slug ? (
                  <Link to={`/author/${article.authors.slug}`} className="flex-shrink-0">
                    {article.authors.avatar_url ? (
                      <img 
                        src={article.authors.avatar_url} 
                        alt={article.authors.name}
                        className="w-32 h-32 rounded-full object-cover hover:opacity-80 transition-opacity ring-4 ring-background shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary hover:opacity-80 transition-opacity ring-4 ring-background shadow-lg" />
                    )}
                  </Link>
                ) : (
                  article.authors.avatar_url ? (
                    <img 
                      src={article.authors.avatar_url} 
                      alt={article.authors.name}
                      className="w-32 h-32 rounded-full object-cover flex-shrink-0 ring-4 ring-background shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 ring-4 ring-background shadow-lg" />
                  )
                )}
                <div className="flex-1 text-center md:text-left">
                  <h4 className="font-semibold text-xl mb-2">
                    {article.authors.slug ? (
                      <Link to={`/author/${article.authors.slug}`} className="hover:text-primary transition-colors">
                        {article.authors.name}
                      </Link>
                    ) : (
                      article.authors.name
                    )}
                  </h4>
                  {article.authors.job_title && (
                    <p className="text-base text-muted-foreground mb-3">
                      {article.authors.job_title}
                    </p>
                  )}
                  {article.authors.bio && (
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {article.authors.bio}
                    </p>
                  )}
                </div>
              </div>
            )}
          </article>

          {/* Related Articles */}
          {relatedArticles && relatedArticles.length > 0 && (
            <section className="bg-muted/30 py-12 mt-12">
              <div className="container mx-auto px-4 max-w-6xl">
                <h2 className="headline text-3xl mb-8">You may also like:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedArticles.map((relatedArticle: any) => (
                    <ArticleCard
                      key={relatedArticle.id}
                      title={relatedArticle.title}
                      excerpt={relatedArticle.excerpt || ""}
                      category={relatedArticle.categories?.name || ""}
                      author={relatedArticle.authors?.name || ""}
                      readTime={`${relatedArticle.reading_time_minutes || 5} min read`}
                      image={relatedArticle.featured_image_url || ""}
                      slug={relatedArticle.slug}
                    />
                  ))}
                  
                  {/* External Link Card for SEO */}
                  <a 
                    href={externalLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-card group hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-6xl">{externalLink.icon}</span>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="headline text-xl mb-3 hover:text-primary transition-colors flex items-center gap-2">
                        {externalLink.text}
                        <ExternalLink className="h-4 w-4" />
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        Explore cutting-edge AI technology and interactive experiences
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="secondary" className="bg-primary text-primary-foreground">
                          External Resource
                        </Badge>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Article;
