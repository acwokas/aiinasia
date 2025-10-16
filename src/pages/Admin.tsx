import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Users, Tag, Folder, MessageSquare, Mail, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
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
      .or("role.eq.admin,role.eq.editor");

    if (!data || data.length === 0) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
  };

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const [articles, authors, categories, tags, comments, subscribers] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("authors").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("tags").select("id", { count: "exact", head: true }),
        supabase.from("comments").select("id", { count: "exact", head: true }),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      ]);

      return {
        articles: articles.count || 0,
        authors: authors.count || 0,
        categories: categories.count || 0,
        tags: tags.count || 0,
        comments: comments.count || 0,
        subscribers: subscribers.count || 0,
      };
    },
  });

  const { data: recentArticles } = useQuery({
    queryKey: ["recent-articles"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select(`
          id,
          title,
          status,
          created_at,
          authors (name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);
      return data;
    },
  });

  const { data: pendingComments } = useQuery({
    queryKey: ["pending-comments"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          author_name,
          created_at,
          articles (title)
        `)
        .eq("approved", false)
        .order("created_at", { ascending: false })
        .limit(5);
      return data;
    },
  });

  const approveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: true })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comment approved",
        description: "The comment is now visible on the article",
      });

      queryClient.invalidateQueries({ queryKey: ['pendingComments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve comment",
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comment deleted",
        description: "The comment has been removed",
      });

      queryClient.invalidateQueries({ queryKey: ['pendingComments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  if (isAdmin === null) {
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
        <div className="mb-8">
          <h1 className="headline text-4xl mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.articles || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.authors || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.subscribers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.categories || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tags</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.tags || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.comments || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="articles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="articles">Recent Articles</TabsTrigger>
            <TabsTrigger value="comments">Pending Comments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Articles</CardTitle>
                <CardDescription>Latest articles across all statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentArticles?.map((article: any) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {article.authors?.name || "Unknown"} • {article.status}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Comments</CardTitle>
                <CardDescription>Comments awaiting moderation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingComments?.map((comment: any) => (
                    <div key={comment.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold">{comment.author_name}</p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => approveComment(comment.id)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteComment(comment.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{comment.content}</p>
                      <p className="text-xs text-muted-foreground">
                        On: {comment.articles?.title}
                      </p>
                    </div>
                  ))}
                  {(!pendingComments || pendingComments.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">
                      No pending comments
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>Configure site-wide options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Google Ads</h4>
                    <p className="text-sm text-muted-foreground">Enable or disable ads site-wide</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Newsletter Popup</h4>
                    <p className="text-sm text-muted-foreground">Manage newsletter signup popup</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Comment Moderation</h4>
                    <p className="text-sm text-muted-foreground">Moderate and manage comments</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">URL Redirects</h4>
                    <p className="text-sm text-muted-foreground">Manage SEO redirects and migrations</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/redirects")}>
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
