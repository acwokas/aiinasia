import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import CMSEditor from "@/components/CMSEditor";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Home } from "lucide-react";

const Editor = () => {
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get("id");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .or("role.eq.admin,role.eq.editor,role.eq.contributor");

    if (!data || data.length === 0) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create or edit articles.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const { data: article, isLoading } = useQuery({
    queryKey: ["article-edit", articleId],
    enabled: !!articleId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleSave = async (data: any) => {
    try {
      if (articleId) {
        const { error } = await supabase
          .from("articles")
          .update({
            ...data,
            updated_by: user.id,
          })
          .eq("id", articleId);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Article updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("articles")
          .insert({
            ...data,
            created_by: user.id,
            updated_by: user.id,
          });

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Article created successfully.",
        });
        navigate("/admin");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary inline-flex items-center gap-1">
            <Home className="h-3 w-3" />
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link to="/admin" className="hover:text-primary">
            Admin
          </Link>
          <span className="mx-2">›</span>
          <span>{articleId ? "Edit Article" : "Create Article"}</span>
        </nav>

        <div className="mb-8">
          <h1 className="headline text-4xl mb-2">
            {articleId ? "Edit Article" : "Create New Article"}
          </h1>
          <p className="text-muted-foreground">
            {articleId ? "Update your article content and settings" : "Write and publish a new article"}
          </p>
        </div>

        <CMSEditor initialData={article} onSave={handleSave} />
      </main>
    </div>
  );
};

export default Editor;
