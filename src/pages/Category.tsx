import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import { MPUAd } from "@/components/GoogleAds";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Clock, Tag as TagIcon, Sparkles } from "lucide-react";
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
          articles!inner (primary_category_id)
        `)
        .eq("articles.primary_category_id", category.id)
        .limit(100);
      
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
        .slice(0, 6);
    },
  });

  const { data: tagArticles } = useQuery({
    queryKey: ["category-tag-articles", popularTags?.[0]?.id],
    enabled: !!popularTags?.[0]?.id && !!category?.id,
    queryFn: async () => {
      if (!popularTags?.[0]?.id || !category?.id) return [];

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
        .eq("tag_id", popularTags[0].id)
        .eq("articles.primary_category_id", category.id)
        .eq("articles.status", "published")
        .order("articles.published_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data?.map((item: any) => item.articles) || [];
    },
  });

  if (categoryLoading || articlesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const featuredArticle = articles?.[0];
  const latestArticles = articles?.slice(1, 7) || [];
  const moreArticles = articles?.slice(7) || [];

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
        {/* Hero Section with Category Description */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 border-b">
          <div className="container mx-auto px-4">
            <Breadcrumb className="mb-6">
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
              <Badge className="mb-4" style={{ backgroundColor: category?.color || 'var(--primary)' }}>
                {category?.name}
              </Badge>
              <h1 className="headline text-5xl md:text-6xl mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {category?.name}
              </h1>
              {category?.description && (
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              )}
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  {articles?.length || 0} articles
                </span>
                {trendingArticles && trendingArticles.length > 0 && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {trendingArticles.length} trending
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Featured & Latest Articles with Ad */}
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Featured Article - Larger Card on Left */}
              {featuredArticle && (
                <div className="lg:col-span-7">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Featured Story
                  </h2>
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
                            {category?.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="headline text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors">
                          {featuredArticle.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {featuredArticle.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{featuredArticle.authors?.name}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {featuredArticle.reading_time_minutes || 5} min read
                          </span>
                        </div>
                      </div>
                    </Link>
                  </Card>
                </div>
              )}

              {/* Right Column: Ad + Latest Articles */}
              <div className="lg:col-span-5 space-y-8">
                {/* MPU Ad Unit - 300x250 Above Fold */}
                <MPUAd />

                {/* Latest Mini Articles */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Latest Updates
                  </h3>
                  <div className="space-y-4">
                    {latestArticles.slice(0, 3).map((article) => (
                      <Link 
                        key={article.id}
                        to={`/${category?.slug}/${article.slug}`}
                        className="flex gap-4 group"
                      >
                        <img 
                          src={article.featured_image_url} 
                          alt={article.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-1">
                            {article.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {article.reading_time_minutes || 5} min read
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Latest Articles Grid */}
          {latestArticles.length > 3 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Recent Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestArticles.slice(3).map((article) => (
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
                    isTrending={article.is_trending}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Trending Articles - Horizontal List */}
          {trendingArticles && trendingArticles.length > 0 && (
            <section className="mb-16 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-8 border border-orange-500/20">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-orange-600" />
                Trending Now
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                      <div className="p-4">
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          {article.reading_time_minutes || 5} min read
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Popular Tags Section */}
          {popularTags && popularTags.length > 0 && tagArticles && tagArticles.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TagIcon className="h-6 w-6 text-primary" />
                  Popular: {popularTags[0].name}
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {popularTags.slice(1, 4).map((tag) => (
                    <Link key={tag.id} to={`/tag/${tag.slug}`}>
                      <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tagArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link to={`/${category?.slug}/${article.slug}`}>
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={article.featured_image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {popularTags[0].name}
                        </Badge>
                        <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors mb-2">
                          {article.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* More Articles - Standard Grid */}
          {moreArticles.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">More from {category?.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {moreArticles.map((article) => (
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
