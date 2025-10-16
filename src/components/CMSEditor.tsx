import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bold, Italic, List, Quote, Link as LinkIcon, Image, Save } from "lucide-react";

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
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");
  const [focusKeyphrase, setFocusKeyphrase] = useState(initialData?.focus_keyphrase || "");
  const [featuredOnHomepage, setFeaturedOnHomepage] = useState(initialData?.featured_on_homepage || false);
  const [sticky, setSticky] = useState(initialData?.sticky || false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!initialData) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = () => {
    const data = {
      title,
      slug,
      excerpt,
      content,
      article_type: articleType,
      status,
      featured_image_url: featuredImage,
      featured_image_alt: featuredImageAlt,
      meta_title: metaTitle,
      meta_description: metaDescription,
      focus_keyphrase: focusKeyphrase,
      featured_on_homepage: featuredOnHomepage,
      sticky,
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
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of the article..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Formatting Toolbar</Label>
                <div className="flex gap-2 p-2 border border-border rounded-lg mb-2">
                  <Button variant="ghost" size="sm" type="button">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button">
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" type="button">
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article content here..."
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="featured-image">Featured Image URL</Label>
                <Input
                  id="featured-image"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline">Preview</Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Article
        </Button>
      </div>
    </div>
  );
};

export default CMSEditor;
