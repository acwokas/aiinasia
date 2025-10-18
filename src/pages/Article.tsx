import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Comments from "@/components/Comments";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Share2, Bookmark, Twitter, Linkedin, Facebook, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";

const Article = () => {
  const { slug } = useParams();
  // Remove trailing slashes from slug for consistent lookups
  const cleanSlug = slug?.replace(/\/+$/g, '');

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", cleanSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug, bio, avatar_url),
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
    queryKey: ["related-articles", article?.primary_category_id],
    enabled: !!article?.primary_category_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug),
          categories:primary_category_id (name)
        `)
        .eq("primary_category_id", article?.primary_category_id)
        .neq("id", article?.id)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

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
    
    // If content is a string (markdown), convert it to HTML
    if (typeof content === 'string') {
      const lines = content.split('\n');
      const blocks: string[] = [];
      let currentParagraph = '';
      let inList = false;
      let listItems: string[] = [];
      
      const finishParagraph = () => {
        if (currentParagraph.trim()) {
          const processed = currentParagraph.trim()
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>');
          blocks.push(`<p class="leading-relaxed mb-6">${processed}</p>`);
          currentParagraph = '';
        }
      };
      
      const finishList = () => {
        if (listItems.length > 0) {
          blocks.push(`<ul class="list-disc ml-6 my-6 space-y-2">${listItems.join('')}</ul>`);
          listItems = [];
          inList = false;
        }
      };
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Empty line - finish current block
        if (!trimmed) {
          finishParagraph();
          finishList();
          continue;
        }
        
        // H3 Heading (check longest first)
        if (trimmed.startsWith('### ')) {
          finishParagraph();
          finishList();
          blocks.push(`<h3 class="text-2xl font-semibold mt-6 mb-3">${trimmed.slice(4)}</h3>`);
          continue;
        }
        
        // H2 Heading
        if (trimmed.startsWith('## ')) {
          finishParagraph();
          finishList();
          blocks.push(`<h2 class="headline text-3xl mt-8 mb-4">${trimmed.slice(3)}</h2>`);
          continue;
        }
        
        // H1 Heading
        if (trimmed.startsWith('# ')) {
          finishParagraph();
          finishList();
          blocks.push(`<h1 class="headline text-4xl mt-8 mb-4">${trimmed.slice(2)}</h1>`);
          continue;
        }
        
        // Blockquote
        if (trimmed.startsWith('> ')) {
          finishParagraph();
          finishList();
          const quote = trimmed.slice(2).trim()
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>');
          blocks.push(`<blockquote class="border-l-4 border-primary pl-6 py-2 my-8 italic text-xl">${quote}</blockquote>`);
          continue;
        }
        
        // List item
        if (trimmed.startsWith('- ')) {
          finishParagraph();
          if (!inList) {
            inList = true;
          }
          const text = trimmed.slice(2).trim()
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>');
          listItems.push(`<li>${text}</li>`);
          continue;
        }
        
        // Regular text - add to current paragraph
        finishList();
        if (currentParagraph) {
          currentParagraph += ' ' + trimmed;
        } else {
          currentParagraph = trimmed;
        }
      }
      
      // Finish any remaining blocks
      finishParagraph();
      finishList();
      
      return <div dangerouslySetInnerHTML={{ __html: blocks.join('') }} />;
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary" />
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      <User className="h-4 w-4" />
                      {article.authors?.name || 'Anonymous'}
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
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Hero Image */}
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

              {article.authors && (
                <div className="bg-muted/50 rounded-lg p-6 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{article.authors.name}</h4>
                    {article.authors.bio && (
                      <p className="text-sm text-muted-foreground">
                        {article.authors.bio}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </footer>

            {/* Comments Section */}
            <Comments articleId={article.id} />
          </article>

          {/* Related Articles */}
          {relatedArticles && relatedArticles.length > 0 && (
            <section className="bg-muted/30 py-12 mt-12">
              <div className="container mx-auto px-4 max-w-6xl">
                <h2 className="headline text-3xl mb-8">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
