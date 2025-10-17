import { Card, CardContent } from "@/components/ui/card";

interface ArticlePreviewProps {
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
}

const ArticlePreview = ({ title, excerpt, content, featuredImage }: ArticlePreviewProps) => {
  const formatContent = (text: string) => {
    if (!text) return '';
    
    // Convert markdown-style formatting to HTML
    let formatted = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul class="list-disc space-y-1 my-4">$1</ul>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic my-4">$1</blockquote>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^\s*$/gm, '');
    
    return `<p class="mb-4">${formatted}</p>`;
  };

  return (
    <Card className="h-full overflow-auto">
      <CardContent className="p-6">
        <article className="prose prose-slate max-w-none">
          {featuredImage && (
            <img
              src={featuredImage}
              alt="Featured"
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <h1 className="text-4xl font-bold mb-4">{title || 'Untitled Article'}</h1>
          
          {excerpt && (
            <p className="text-lg text-muted-foreground mb-6 italic border-l-4 border-primary pl-4">
              {excerpt}
            </p>
          )}
          
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          />
        </article>
      </CardContent>
    </Card>
  );
};

export default ArticlePreview;
