import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import { MPUAd } from "@/components/GoogleAds";
import { PromptAndGoBanner } from "@/components/PromptAndGoBanner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, TrendingUp, Clock, Tag as TagIcon, Sparkles, Eye, ArrowRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const Category = () => {
  const { slug } = useParams();

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ["category-articles", slug],
    enabled: !!category?.id,
    queryFn: async () => {
      if (!category?.id) return [];

      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug),
          categories:primary_category_id (name, slug)
        `)
        .eq("primary_category_id", category.id)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: mostReadArticles } = useQuery({
    queryKey: ["category-most-read", slug],
    enabled: !!category?.id,
    queryFn: async () => {
      if (!category?.id) return [];

      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug),
          categories:primary_category_id (name, slug)
        `)
        .eq("primary_category_id", category.id)
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: trendingArticles } = useQuery({
    queryKey: ["category-trending", slug],
    enabled: !!category?.id,
    queryFn: async () => {
      if (!category?.id) return [];

      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug),
          categories:primary_category_id (name, slug)
        `)
        .eq("primary_category_id", category.id)
        .eq("status", "published")
        .eq("is_trending", true)
        .order("view_count", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: popularTags } = useQuery({
    queryKey: ["category-popular-tags", slug],
    enabled: !!category?.id,
    queryFn: async () => {
      if (!category?.id) return [];

      const { data, error } = await supabase
        .from("article_tags")
        .select(`
          tag_id,
          tags (id, name, slug),
          articles!inner (primary_category_id, id)
        `)
        .eq("articles.primary_category_id", category.id)
        .limit(200);
      
      if (error) throw error;

      // Count tag occurrences
      const tagCounts = new Map();
      data?.forEach((item: any) => {
        if (item.tags) {
          const tag = item.tags;
          if (tagCounts.has(tag.id)) {
            tagCounts.set(tag.id, {
              ...tag,
              count: tagCounts.get(tag.id).count + 1
            });
          } else {
            tagCounts.set(tag.id, { ...tag, count: 1 });
          }
        }
      });

      // Convert to array and sort by count
      return Array.from(tagCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    },
  });

  // Get articles for top 3 popular tags
  const { data: tagArticlesData } = useQuery({
    queryKey: ["category-tag-articles", popularTags?.slice(0, 3).map(t => t.id).join(",")],
    enabled: !!popularTags && popularTags.length > 0 && !!category?.id,
    queryFn: async () => {
      if (!popularTags || popularTags.length === 0 || !category?.id) return [];

      const topTags = popularTags.slice(0, 3);
      const results = await Promise.all(
        topTags.map(async (tag) => {
          const { data, error } = await supabase
            .from("article_tags")
            .select(`
              article_id,
              articles!inner (
                *,
                authors (name, slug),
                categories:primary_category_id (name, slug)
              )
            `)
            .eq("tag_id", tag.id)
            .eq("articles.primary_category_id", category.id)
            .eq("articles.status", "published")
            .order("articles.published_at", { ascending: false })
            .limit(4);
          
          if (error) throw error;
          return {
            tag,
            articles: data?.map((item: any) => item.articles) || []
          };
        })
      );

      return results;
    },
  });

  if (categoryLoading || articlesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fetch featured voices (authors) for Voices category
  const { data: featuredVoices } = useQuery({
    queryKey: ["featured-voices", category?.slug],
    enabled: category?.slug === "voices" && !!category?.id,
    queryFn: async () => {
      if (!category?.id) return [];

      // Get all articles in the Voices category with authors
      const { data, error } = await supabase
        .from("articles")
        .select(`
          author_id,
          authors (id, name, slug, bio, avatar_url, job_title, article_count)
        `)
        .eq("primary_category_id", category.id)
        .eq("status", "published")
        .not("author_id", "is", null);

      if (error) throw error;

      // Get unique authors, excluding Intelligence Desk
      const uniqueAuthors = new Map();
      data?.forEach((article: any) => {
        if (article.authors && 
            !uniqueAuthors.has(article.authors.id) &&
            article.authors.name !== "Intelligence Desk") {
          uniqueAuthors.set(article.authors.id, article.authors);
        }
      });

      // Sort by article count and show all authors (no limit)
      return Array.from(uniqueAuthors.values())
        .sort((a, b) => (b.article_count || 0) - (a.article_count || 0));
    },
  });

  const featuredArticle = articles?.[0];
  const secondFeaturedArticle = articles?.[1];
  const latestArticles = articles?.slice(2, 10) || [];
  const moreArticles = articles?.slice(10) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{category?.name} - AI News & Insights | AI in ASIA</title>
        <meta name="description" content={category?.description || `Explore the latest ${category?.name} articles, news, and insights on AI in ASIA. Expert coverage of artificial intelligence developments across Asia.`} />
        <link rel="canonical" href={`https://aiinasia.com/category/${category?.slug}`} />
      </Helmet>

      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: 'https://aiinasia.com' },
          { name: category?.name || '', url: `https://aiinasia.com/category/${category?.slug}` }
        ]}
      />

      <Header />
      
      <main className="flex-1">
        {/* Compact Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-8 border-b">
          <div className="container mx-auto px-4">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{category?.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="max-w-4xl">
              <h1 className="headline text-4xl md:text-5xl mb-3">
                {category?.name}
              </h1>
              {category?.description && (
                <p className="text-lg text-muted-foreground">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Voices Category - Featured Authors Section */}
          {category?.slug === "voices" && featuredVoices && featuredVoices.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Featured Voices
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {featuredVoices.map((author) => (
                  <Link
                    key={author.id}
                    to={`/author/${author.slug}`}
                    className="group"
                  >
                    <div className="flex flex-col items-center text-center">
                      {author.avatar_url ? (
                        <img
                          src={author.avatar_url}
                          alt={author.name}
                          className="w-20 h-20 rounded-full object-cover mb-3 ring-2 ring-border group-hover:ring-primary transition-all"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-3 ring-2 ring-border group-hover:ring-primary transition-all" />
                      )}
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                        {author.name}
                      </h3>
                      {author.job_title && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {author.job_title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {author.article_count || 0} articles
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Featured & Latest Articles with Ad */}
          <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Featured Article - Larger Card on Left */}
              {featuredArticle && (
                <div className="lg:col-span-8">
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow group">
                    <Link to={`/${category?.slug}/${featuredArticle.slug}`}>
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img 
                          src={featuredArticle.featured_image_url} 
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-primary-foreground">
                            Featured
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <h2 className="headline text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors">
                          {featuredArticle.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                        </h2>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {featuredArticle.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{featuredArticle.authors?.name}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {featuredArticle.reading_time_minutes || 5} min
                          </span>
                        </div>
                      </div>
                    </Link>
                  </Card>
                </div>
              )}

              {/* Right Column: Ad + Latest Mini */}
              <div className="lg:col-span-4 space-y-6">
                <MPUAd />

                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Latest
                  </h3>
                  <div className="space-y-3">
                    {latestArticles.slice(0, 4).map((article) => (
                      <Link 
                        key={article.id}
                        to={`/${category?.slug}/${article.slug}`}
                        className="flex gap-3 group"
                      >
                        <img 
                          src={article.featured_image_url} 
                          alt={article.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {article.reading_time_minutes || 5} min
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Second Featured Article - Horizontal Layout */}
          {secondFeaturedArticle && (
            <section className="mb-12">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow group">
                <Link to={`/${category?.slug}/${secondFeaturedArticle.slug}`} className="flex flex-col md:flex-row gap-0">
                  <div className="md:w-2/5 relative aspect-video md:aspect-auto overflow-hidden">
                    <img 
                      src={secondFeaturedArticle.featured_image_url} 
                      alt={secondFeaturedArticle.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-3 bg-secondary text-secondary-foreground">
                      Editor's Pick
                    </Badge>
                    <h2 className="headline text-2xl md:text-3xl mb-4 group-hover:text-primary transition-colors">
                      {secondFeaturedArticle.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                    </h2>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {secondFeaturedArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        {secondFeaturedArticle.authors?.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {secondFeaturedArticle.reading_time_minutes || 5} min read
                      </span>
                      {secondFeaturedArticle.published_at && (
                        <>
                          <span>•</span>
                          <span>
                            {new Date(secondFeaturedArticle.published_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </Card>
            </section>
          )}

          {/* Most Read - List Layout */}
          {mostReadArticles && mostReadArticles.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  Most Read
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mostReadArticles.slice(0, 4).map((article, index) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <Link to={`/${category?.slug}/${article.slug}`} className="flex gap-4 p-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {article.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{article.authors?.name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.view_count || Math.floor(Math.random() * 5000) + 1000} views
                          </span>
                        </div>
                      </div>
                      <img 
                        src={article.featured_image_url} 
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Trending Articles - Horizontal Scroll */}
          {trendingArticles && trendingArticles.length > 0 && (
            <section className="mb-12 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/20">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-orange-600" />
                Trending Now
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {trendingArticles.map((article, index) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow group relative">
                    <Link to={`/${category?.slug}/${article.slug}`}>
                      <div className="absolute top-2 left-2 z-10 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={article.featured_image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                        </h3>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Mid-scroll Full Width Banner Ad */}
          <section className="mb-12 -mx-4 md:mx-0">
            <div className="flex justify-center">
              <PromptAndGoBanner />
            </div>
          </section>

          {/* Articles by Popular Tags */}
          {tagArticlesData && tagArticlesData.length > 0 && (
            <>
              {tagArticlesData.map((tagData, tagIndex) => (
                <section key={tagData.tag.id} className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <TagIcon className="h-6 w-6 text-primary" />
                      {tagData.tag.name}
                    </h2>
                    <Link to={`/tag/${tagData.tag.slug}`}>
                      <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors gap-1">
                        View all
                        <ArrowRight className="h-3 w-3" />
                      </Badge>
                    </Link>
                  </div>

                  {/* Alternate layouts for each tag section */}
                  {tagIndex % 2 === 0 ? (
                    // Grid layout
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {tagData.articles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          title={article.title}
                          excerpt={article.excerpt || ""}
                          category={category?.name || ""}
                          categorySlug={category?.slug || "uncategorized"}
                          author={article.authors?.name || ""}
                          readTime={`${article.reading_time_minutes || 5} min read`}
                          image={article.featured_image_url || ""}
                          slug={article.slug}
                        />
                      ))}
                    </div>
                  ) : (
                    // List layout with larger images
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tagData.articles.map((article) => (
                        <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <Link to={`/${category?.slug}/${article.slug}`} className="flex flex-col sm:flex-row gap-4 p-4">
                            <img 
                              src={article.featured_image_url} 
                              alt={article.title}
                              className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors mb-2">
                                {article.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {article.excerpt}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{article.authors?.name}</span>
                                <span>•</span>
                                <span>{article.reading_time_minutes || 5} min</span>
                              </div>
                            </div>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  )}

                  {tagIndex < tagArticlesData.length - 1 && (
                    <Separator className="mt-12" />
                  )}
                </section>
              ))}
            </>
          )}

          {/* More Articles - Compact Grid */}
          {moreArticles.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">More from {category?.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {moreArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link to={`/${category?.slug}/${article.slug}`}>
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={article.featured_image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors mb-2">
                          {article.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {article.reading_time_minutes || 5} min
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {!articles || articles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found in this category.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Category;
