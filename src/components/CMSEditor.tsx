import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Save, Upload, Loader2, Info, Plus, Pencil, CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ScoutWritingAssistant from "@/components/ScoutWritingAssistant";
import RichTextEditor from "@/components/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/imageCompression";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CMSEditorProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

const CMSEditor = ({ initialData, onSave }: CMSEditorProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [articleType, setArticleType] = useState(initialData?.article_type || "news");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image_url || "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featured_image_alt || "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");
  const [focusKeyphrase, setFocusKeyphrase] = useState(initialData?.focus_keyphrase || "");
  const [keyphraseSynonyms, setKeyphraseSynonyms] = useState(initialData?.keyphrase_synonyms || "");
  const [featuredOnHomepage, setFeaturedOnHomepage] = useState(initialData?.featured_on_homepage || false);
  const [sticky, setSticky] = useState(initialData?.sticky || false);
  const [authorId, setAuthorId] = useState(initialData?.author_id || "dc6a0958-a872-48ab-ae1a-76eb4e1ea4a4");
  const [primaryCategoryId, setPrimaryCategoryId] = useState(initialData?.primary_category_id || "");
  const [scheduledFor, setScheduledFor] = useState<Date | undefined>(
    initialData?.scheduled_for ? new Date(initialData.scheduled_for) : undefined
  );
  const [scheduledTime, setScheduledTime] = useState(
    initialData?.scheduled_for 
      ? format(new Date(initialData.scheduled_for), "HH:mm")
      : "09:00"
  );
  const [selectedText, setSelectedText] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showAuthorDialog, setShowAuthorDialog] = useState(false);
  const [isEditingAuthor, setIsEditingAuthor] = useState(false);
  const [authorForm, setAuthorForm] = useState({
    id: "",
    name: "",
    slug: "",
    job_title: "",
    bio: "",
    email: "",
    avatar_url: "",
    twitter_handle: "",
    linkedin_url: "",
    website_url: ""
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch authors
  const { data: authors } = useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .replace(/\/+$/g, ""); // Remove trailing slashes
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!initialData) {
      setSlug(generateSlug(value));
    }
  };

  const handleTextSelection = (textarea: HTMLTextAreaElement) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    setSelectedText(selected);
  };

  const replaceSelectedText = (newText: string) => {
    const textarea = contentRef.current || excerptRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    const newValue = currentValue.substring(0, start) + newText + currentValue.substring(end);
    
    if (textarea === contentRef.current) {
      setContent(newValue);
    } else {
      setExcerpt(newValue);
    }
    
    setSelectedText("");
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      // Compress image before upload
      toast({
        title: "Optimizing image...",
        description: "Compressing image for best performance",
      });

      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        maxSizeMB: 1,
      });

      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
      
      console.log(`Image compressed: ${originalSizeMB}MB → ${compressedSizeMB}MB`);

      const fileExt = 'jpg'; // Always use jpg after compression
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      setFeaturedImage(publicUrl);
      
      toast({
        title: "Image uploaded",
        description: `Optimized and uploaded (${originalSizeMB}MB → ${compressedSizeMB}MB)`,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenAuthorDialog = (author?: any) => {
    console.log('Opening author dialog with:', author);
    if (author) {
      setIsEditingAuthor(true);
      const formData = {
        id: author.id,
        name: author.name,
        slug: author.slug,
        job_title: author.job_title || "",
        bio: author.bio || "",
        email: author.email || "",
        avatar_url: author.avatar_url || "",
        twitter_handle: author.twitter_handle || "",
        linkedin_url: author.linkedin_url || "",
        website_url: author.website_url || ""
      };
      console.log('Author form data:', formData);
      setAuthorForm(formData);
      setAvatarPreview(author.avatar_url || "");
    } else {
      setIsEditingAuthor(false);
      setAuthorForm({
        id: "",
        name: "",
        slug: "",
        job_title: "",
        bio: "",
        email: "",
        avatar_url: "",
        twitter_handle: "",
        linkedin_url: "",
        website_url: ""
      });
      setAvatarPreview("");
    }
    setAvatarFile(null);
    setShowAuthorDialog(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAuthor = async () => {
    try {
      let avatarUrl = authorForm.avatar_url;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('article-images')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('article-images')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const authorData = {
        name: authorForm.name,
        slug: authorForm.slug || generateSlug(authorForm.name),
        job_title: authorForm.job_title || null,
        bio: authorForm.bio || null,
        email: authorForm.email || null,
        avatar_url: avatarUrl || null,
        twitter_handle: authorForm.twitter_handle || null,
        linkedin_url: authorForm.linkedin_url || null,
        website_url: authorForm.website_url || null
      };

      if (isEditingAuthor && authorForm.id) {
        const { error } = await supabase
          .from('authors')
          .update(authorData)
          .eq('id', authorForm.id);
        
        if (error) throw error;
        
        toast({
          title: "Author updated",
          description: "Author information has been updated successfully"
        });
      } else {
        const { data, error } = await supabase
          .from('authors')
          .insert(authorData)
          .select()
          .single();
        
        if (error) throw error;
        
        setAuthorId(data.id);
        toast({
          title: "Author created",
          description: "New author has been created successfully"
        });
      }

      queryClient.invalidateQueries({ queryKey: ['authors'] });
      setShowAuthorDialog(false);
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (error) {
      console.error('Error saving author:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save author",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    let scheduledDateTime = null;
    if (scheduledFor && scheduledTime) {
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const dateTime = new Date(scheduledFor);
      dateTime.setHours(hours, minutes, 0, 0);
      scheduledDateTime = dateTime.toISOString();
    }

    const data = {
      title,
      slug: slug.replace(/\//g, ''),
      excerpt,
      content,
      article_type: articleType,
      status,
      featured_image_url: featuredImage,
      featured_image_alt: featuredImageAlt,
      seo_title: seoTitle,
      meta_title: metaTitle,
      meta_description: metaDescription,
      focus_keyphrase: focusKeyphrase,
      keyphrase_synonyms: keyphraseSynonyms,
      featured_on_homepage: featuredOnHomepage,
      sticky,
      author_id: authorId || null,
      primary_category_id: primaryCategoryId || null,
      scheduled_for: scheduledDateTime,
    };
    onSave?.(data);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>Write and format your article</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title..."
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="article-url-slug"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <ScoutWritingAssistant
                    selectedText={selectedText}
                    onReplace={replaceSelectedText}
                    context={{ title, fullContent: content }}
                  />
                </div>
                <Textarea
                  ref={excerptRef}
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  onSelect={(e) => handleTextSelection(e.currentTarget)}
                  placeholder="Brief summary of the article..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="featured-image">Featured Image</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Paste URL or upload (auto-optimized to ~1MB)
                  </p>
                  <div className="flex gap-2">
                    <Input
                      id="featured-image"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="Paste image URL or upload below"
                      className="flex-1"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      title="Upload & optimize image"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {featuredImage && (
                    <div className="mt-2">
                      <img
                        src={featuredImage}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="featured-image-alt">Featured Image Alt Text</Label>
                  <Input
                    id="featured-image-alt"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                    placeholder="Descriptive alt text for accessibility"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Article Content (Live Preview)</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Info className="h-3 w-3" />
                      <span>Use markdown: **bold** *italic* # heading</span>
                    </div>
                    <ScoutWritingAssistant
                      selectedText={selectedText}
                      onReplace={replaceSelectedText}
                      context={{ title, fullContent: content }}
                    />
                  </div>
                </div>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  onSelect={setSelectedText}
                  placeholder="Start writing your article... Use markdown for formatting."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimise your article for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo-title">SEO Title</Label>
                <Input
                  id="seo-title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="SEO title (max 60 characters)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {seoTitle.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO title (max 60 characters)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO description (max 160 characters)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <Label htmlFor="focus-keyphrase">Focus Keyphrase</Label>
                <Input
                  id="focus-keyphrase"
                  value={focusKeyphrase}
                  onChange={(e) => setFocusKeyphrase(e.target.value)}
                  placeholder="Primary keyword for this article"
                />
              </div>

              <div>
                <Label htmlFor="keyphrase-synonyms">Keyphrase Synonyms</Label>
                <Input
                  id="keyphrase-synonyms"
                  value={keyphraseSynonyms}
                  onChange={(e) => setKeyphraseSynonyms(e.target.value)}
                  placeholder="Comma separated list of synonyms"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  e.g., artificial intelligence, machine learning, AI technology
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Settings</CardTitle>
              <CardDescription>Configure article type and visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="article-type">Article Type</Label>
                <Select value={articleType} onValueChange={setArticleType}>
                  <SelectTrigger id="article-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="opinion">Opinion</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="life">Life</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Feature on Homepage</Label>
                  <p className="text-xs text-muted-foreground">
                    Display this article prominently on the homepage
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={featuredOnHomepage}
                  onCheckedChange={setFeaturedOnHomepage}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sticky">Sticky</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep this article at the top of lists
                  </p>
                </div>
                <Switch
                  id="sticky"
                  checked={sticky}
                  onCheckedChange={setSticky}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Schedule for Publishing</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Set a date and time to automatically publish this article
                  </p>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !scheduledFor && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledFor ? format(scheduledFor, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduledFor}
                          onSelect={setScheduledFor}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-32"
                      />
                    </div>
                    {scheduledFor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setScheduledFor(undefined);
                          setScheduledTime("09:00");
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="primary-category">Primary Category</Label>
                <Select value={primaryCategoryId} onValueChange={setPrimaryCategoryId}>
                  <SelectTrigger id="primary-category">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Main category for this article (used for related articles)
                </p>
              </div>

              <div>
                <Label htmlFor="author">Author</Label>
                <div className="flex gap-2">
                  <Select value={authorId} onValueChange={setAuthorId}>
                    <SelectTrigger id="author" className="flex-1">
                      <SelectValue placeholder="Select author..." />
                    </SelectTrigger>
                    <SelectContent>
                      {authors?.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenAuthorDialog()}
                    title="Create new author"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {authorId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const author = authors?.find(a => a.id === authorId);
                        if (author) handleOpenAuthorDialog(author);
                      }}
                      title="Edit selected author"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Author Dialog */}
      <Dialog open={showAuthorDialog} onOpenChange={setShowAuthorDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditingAuthor ? 'Edit Author' : 'Create New Author'}</DialogTitle>
            <DialogDescription>
              {isEditingAuthor ? 'Update author information' : 'Add a new author to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="author-name">Name *</Label>
              <Input
                id="author-name"
                value={authorForm.name}
                onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                placeholder="Author name"
              />
            </div>
            <div>
              <Label htmlFor="author-slug">Slug</Label>
              <Input
                id="author-slug"
                value={authorForm.slug}
                onChange={(e) => setAuthorForm({ ...authorForm, slug: e.target.value })}
                placeholder="author-slug (auto-generated if empty)"
              />
            </div>
            <div>
              <Label htmlFor="author-job-title">Job Title</Label>
              <Input
                id="author-job-title"
                value={authorForm.job_title}
                onChange={(e) => setAuthorForm({ ...authorForm, job_title: e.target.value })}
                placeholder="Chief Editor, Senior Writer, etc."
              />
            </div>
            <div>
              <Label htmlFor="author-email">Email</Label>
              <Input
                id="author-email"
                type="email"
                value={authorForm.email}
                onChange={(e) => setAuthorForm({ ...authorForm, email: e.target.value })}
                placeholder="author@example.com"
              />
            </div>
            <div>
              <Label htmlFor="author-bio">Bio</Label>
              <Textarea
                id="author-bio"
                value={authorForm.bio}
                onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
                placeholder="Brief biography..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="author-avatar">Avatar Image</Label>
              <Input
                id="author-avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="cursor-pointer"
              />
              {(avatarPreview || authorForm.avatar_url) && (
                <div className="mt-2">
                  <img
                    src={avatarPreview || authorForm.avatar_url}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover border border-border"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="author-twitter">Twitter Handle</Label>
              <Input
                id="author-twitter"
                value={authorForm.twitter_handle}
                onChange={(e) => setAuthorForm({ ...authorForm, twitter_handle: e.target.value })}
                placeholder="@username"
              />
            </div>
            <div>
              <Label htmlFor="author-linkedin">LinkedIn URL</Label>
              <Input
                id="author-linkedin"
                value={authorForm.linkedin_url}
                onChange={(e) => setAuthorForm({ ...authorForm, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <Label htmlFor="author-website">Website URL</Label>
              <Input
                id="author-website"
                value={authorForm.website_url}
                onChange={(e) => setAuthorForm({ ...authorForm, website_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuthorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAuthor} disabled={!authorForm.name.trim()}>
              {isEditingAuthor ? 'Update Author' : 'Create Author'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Article
        </Button>
      </div>
    </div>
  );
};

export default CMSEditor;
