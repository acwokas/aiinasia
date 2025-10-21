import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ArticleCard from "./ArticleCard";
import { Sparkles, Loader2 } from "lucide-react";

const RecommendedArticles = () => {
  const { user } = useAuth();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommendations", user?.id],
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-recommendations", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;
      return data;
    },
  });

  if (!user) return null;
  
  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <h2 className="text-2xl font-bold">Generating your recommendations...</h2>
        </div>
      </section>
    );
  }

  if (!recommendations?.recommendations || recommendations.recommendations.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-12 bg-muted/30">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">
          {recommendations.reason === "ai_personalized" 
            ? "Recommended For You" 
            : recommendations.reason === "trending"
            ? "Trending Now"
            : "You Might Like"}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.recommendations.map((article: any) => (
          <ArticleCard
            key={article.id}
            title={article.title}
            excerpt={article.excerpt || ""}
            category={article.categories?.name || ""}
            categorySlug={article.categories?.slug || "uncategorized"}
            author="AI in ASIA"
            readTime={`${article.reading_time_minutes || 5} min read`}
            image={article.featured_image_url || ""}
            slug={article.slug}
          />
        ))}
      </div>
    </section>
  );
};

export default RecommendedArticles;
