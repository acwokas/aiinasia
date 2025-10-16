import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");
      return data || [];
    },
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", searchQuery, categoryFilter],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select(`
          *,
          authors (name, slug),
          categories:primary_category_id (name)
        `)
        .eq("status", "published")
        .or(`title.ilike.%${searchQuery}%, excerpt.ilike.%${searchQuery}%`)
        .order("published_at", { ascending: false })
        .limit(50);

      if (categoryFilter !== "all") {
        query = query.eq("primary_category_id", categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery, category: categoryFilter });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <h1 className="headline text-4xl md:text-5xl mb-8">Search Articles</h1>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-3xl">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button type="submit">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && searchQuery && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                Found {results?.length || 0} results for "{searchQuery}"
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results?.map((article: any) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                excerpt={article.excerpt || ""}
                category={article.categories?.name || ""}
                author={article.authors?.name || ""}
                readTime={`${article.reading_time_minutes || 5} min read`}
                image={article.featured_image_url || ""}
              />
            ))}
          </div>

          {!isLoading && searchQuery && results?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No articles found matching your search.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
