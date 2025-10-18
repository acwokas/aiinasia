import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Users, Tag, Folder, MessageSquare, Mail, BarChart, Home, Pencil, Trash2, Plus, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/imageCompression";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authorsDialogOpen, setAuthorsDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [authorForm, setAuthorForm] = useState({
    name: "",
    slug: "",
    bio: "",
    email: "",
    job_title: "",
    avatar_url: "",
    twitter_handle: "",
    linkedin_url: "",
    website_url: "",
  });

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

  const { data: authors, refetch: refetchAuthors } = useQuery({
    queryKey: ["all-authors"],
    enabled: isAdmin === true && authorsDialogOpen,
    queryFn: async () => {
      const { data } = await supabase
        .from("authors")
        .select("*")
        .order("name", { ascending: true });
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

  const getFirstName = (email: string | undefined) => {
    if (!email) return "User";
    const username = email.split("@")[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  const handleOpenAuthorsDialog = () => {
    setAuthorsDialogOpen(true);
    resetAuthorForm();
  };

  const resetAuthorForm = () => {
    setEditingAuthor(null);
    setAuthorForm({
      name: "",
      slug: "",
      bio: "",
      email: "",
      job_title: "",
      avatar_url: "",
      twitter_handle: "",
      linkedin_url: "",
      website_url: "",
    });
  };

  const handleEditAuthor = (author: any) => {
    setEditingAuthor(author);
    setAuthorForm({
      name: author.name || "",
      slug: author.slug || "",
      bio: author.bio || "",
      email: author.email || "",
      job_title: author.job_title || "",
      avatar_url: author.avatar_url || "",
      twitter_handle: author.twitter_handle || "",
      linkedin_url: author.linkedin_url || "",
      website_url: author.website_url || "",
    });
  };

  const handleSaveAuthor = async () => {
    try {
      if (editingAuthor) {
        const { error } = await supabase
          .from("authors")
          .update(authorForm)
          .eq("id", editingAuthor.id);

        if (error) throw error;

        toast({
          title: "Author updated",
          description: "The author has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("authors")
          .insert([authorForm]);

        if (error) throw error;

        toast({
          title: "Author created",
          description: "The author has been created successfully",
        });
      }

      refetchAuthors();
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      resetAuthorForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save author",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAuthor = async (authorId: string) => {
    if (!confirm("Are you sure you want to delete this author? This cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("authors")
        .delete()
        .eq("id", authorId);

      if (error) throw error;

      toast({
        title: "Author deleted",
        description: "The author has been removed",
      });

      refetchAuthors();
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete author",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      // Compress the image
      const compressedFile = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9,
        maxSizeMB: 0.5,
      });

      // Generate unique filename
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('article-images')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      // Update form with the new URL
      setAuthorForm({ ...authorForm, avatar_url: publicUrl });

      toast({
        title: "Image uploaded",
        description: "Avatar image has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAuthorForm({ ...authorForm, avatar_url: "" });
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
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary inline-flex items-center gap-1">
            <Home className="h-3 w-3" />
            Home
          </Link>
          <span className="mx-2">›</span>
          <span>Admin Dashboard</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="headline text-4xl mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {getFirstName(user?.email)}</p>
            </div>
            <Button onClick={() => navigate("/editor")} size="lg">
              <FileText className="h-4 w-4 mr-2" />
              Create New Article
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate("/admin/articles")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.articles || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Click to manage all</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={handleOpenAuthorsDialog}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.authors || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Click to manage all</p>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/editor?id=${article.id}`)}
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => navigate("/admin/articles")}>
                  View All Articles
                </Button>
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

        {/* Authors Management Dialog */}
        <Dialog open={authorsDialogOpen} onOpenChange={setAuthorsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Authors</DialogTitle>
              <DialogDescription>Add, edit, or delete authors</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Author Form */}
              <div className="border border-border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-lg">
                  {editingAuthor ? "Edit Author" : "Add New Author"}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={authorForm.name}
                      onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={authorForm.slug}
                      onChange={(e) => setAuthorForm({ ...authorForm, slug: e.target.value })}
                      placeholder="john-doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={authorForm.email}
                      onChange={(e) => setAuthorForm({ ...authorForm, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={authorForm.job_title}
                      onChange={(e) => setAuthorForm({ ...authorForm, job_title: e.target.value })}
                      placeholder="Senior Writer"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={authorForm.bio}
                      onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
                      placeholder="Author biography..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="avatar">Avatar Image</Label>
                    {authorForm.avatar_url ? (
                      <div className="space-y-2">
                        <div className="relative inline-block">
                          <img 
                            src={authorForm.avatar_url} 
                            alt="Avatar preview" 
                            className="h-24 w-24 rounded-full object-cover border-2 border-border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={handleRemoveAvatar}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          value={authorForm.avatar_url}
                          onChange={(e) => setAuthorForm({ ...authorForm, avatar_url: e.target.value })}
                          placeholder="Or enter URL directly"
                          className="text-sm"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="flex-1"
                          />
                          {uploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                        <Input
                          value={authorForm.avatar_url}
                          onChange={(e) => setAuthorForm({ ...authorForm, avatar_url: e.target.value })}
                          placeholder="Or enter URL directly"
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter_handle">Twitter Handle</Label>
                    <Input
                      id="twitter_handle"
                      value={authorForm.twitter_handle}
                      onChange={(e) => setAuthorForm({ ...authorForm, twitter_handle: e.target.value })}
                      placeholder="@johndoe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <Input
                      id="linkedin_url"
                      value={authorForm.linkedin_url}
                      onChange={(e) => setAuthorForm({ ...authorForm, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      value={authorForm.website_url}
                      onChange={(e) => setAuthorForm({ ...authorForm, website_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSaveAuthor}>
                    {editingAuthor ? "Update Author" : "Create Author"}
                  </Button>
                  {editingAuthor && (
                    <Button variant="outline" onClick={resetAuthorForm}>
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Authors List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Existing Authors</h3>
                <div className="space-y-2">
                  {authors?.map((author: any) => (
                    <div key={author.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{author.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {author.job_title || "No job title"} • {author.email || "No email"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAuthor(author)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAuthor(author.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!authors || authors.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">
                      No authors yet. Create your first author above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;
