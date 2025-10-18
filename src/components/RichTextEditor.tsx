import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Heading1, Heading2, Heading3, List, Quote, Link as LinkIcon, Minus, Image, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (selectedText: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  onSelect,
  placeholder = "Start writing...",
  label,
  className,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [imageData, setImageData] = useState({ url: '', caption: '', alt: '', description: '' });
  const [linkData, setLinkData] = useState({ url: '', openInNewTab: false });

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = convertMarkdownToHtml(value);
    }
  }, []);

  const convertMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    
    return markdown
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>\s*)+/gs, '<ul>$&</ul>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

  const convertHtmlToMarkdown = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    let markdown = html
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<b>(.*?)<\/b>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<i>(.*?)<\/i>/g, '*$1*')
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gs, '$1\n')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/g, '> $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<div[^>]*>(.*?)<\/div>/gs, '$1\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return markdown;
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleFormat = (format: string) => {
    switch (format) {
      case 'bold':
        execCommand('bold');
        break;
      case 'italic':
        execCommand('italic');
        break;
      case 'h1':
        execCommand('formatBlock', '<h1>');
        break;
      case 'h2':
        execCommand('formatBlock', '<h2>');
        break;
      case 'h3':
        execCommand('formatBlock', '<h3>');
        break;
      case 'paragraph':
        execCommand('formatBlock', '<p>');
        break;
      case 'list':
        execCommand('insertUnorderedList');
        break;
      case 'quote':
        execCommand('formatBlock', '<blockquote>');
        break;
      case 'hr':
        execCommand('insertHorizontalRule');
        break;
      case 'image':
        imageInputRef.current?.click();
        break;
      case 'link':
        setShowLinkDialog(true);
        break;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setImageData({ url: imageUrl, caption: '', alt: '', description: '' });
      setShowImageDialog(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleInsertImage = () => {
    if (!imageData.url) return;
    
    execCommand('insertImage', imageData.url);
    
    // Add alt text and other attributes after insertion
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        let node = selection.anchorNode;
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentElement;
        }
        
        // Find the img element
        let imgElement: HTMLElement | null = node as HTMLElement;
        while (imgElement && imgElement !== editorRef.current) {
          if (imgElement.tagName === 'IMG') {
            if (imageData.alt) imgElement.setAttribute('alt', imageData.alt);
            if (imageData.description) imgElement.setAttribute('title', imageData.description);
            
            // Add caption as a wrapper
            if (imageData.caption) {
              const figure = document.createElement('figure');
              const figcaption = document.createElement('figcaption');
              figcaption.textContent = imageData.caption;
              figcaption.className = 'text-sm text-muted-foreground mt-2 text-center italic';
              
              imgElement.parentNode?.insertBefore(figure, imgElement);
              figure.appendChild(imgElement);
              figure.appendChild(figcaption);
            }
            break;
          }
          imgElement = imgElement.parentElement;
        }
      }
    }, 0);
    
    setShowImageDialog(false);
    setImageData({ url: '', caption: '', alt: '', description: '' });
    editorRef.current?.focus();
  };

  const handleInsertLink = () => {
    if (!linkData.url) return;
    
    execCommand('createLink', linkData.url);
    
    // Add target="_blank" if user wants to open in new tab
    if (linkData.openInNewTab) {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
          let node = selection.anchorNode.parentElement;
          while (node && node !== editorRef.current) {
            if (node.tagName === 'A') {
              node.setAttribute('target', '_blank');
              node.setAttribute('rel', 'noopener noreferrer');
              break;
            }
            node = node.parentElement;
          }
        }
      }, 0);
    }
    
    setShowLinkDialog(false);
    setLinkData({ url: '', openInNewTab: false });
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    const text = editorRef.current.innerText || '';
    
    setIsEmpty(text.trim().length === 0);
    
    const markdown = convertHtmlToMarkdown(content);
    onChange(markdown);
  };

  const handleSelection = () => {
    if (!onSelect) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      onSelect(selection.toString());
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (modKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          handleFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          handleFormat('italic');
          break;
        case 'k':
          e.preventDefault();
          setShowLinkDialog(true);
          break;
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      <div className="sticky top-0 z-10 flex items-center gap-1 p-2 border border-input rounded-t-md bg-background/95 backdrop-blur flex-wrap shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('h1')}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('h2')}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('h3')}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('paragraph')}
          title="Paragraph"
        >
          <Type className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('list')}
          title="List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('quote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('link')}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('hr')}
          title="Horizontal Line"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('image')}
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        {isEmpty && (
          <div className="absolute top-3 left-4 text-muted-foreground pointer-events-none z-10">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onSelect={handleSelection}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className={cn(
            "min-h-[400px] w-full rounded-b-md border border-t-0 border-input bg-background px-4 py-3",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "prose prose-slate max-w-none",
            "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4",
            "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3",
            "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2",
            "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4",
            "[&_li]:my-1",
            "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
            "[&_a]:text-primary [&_a]:underline [&_a]:hover:no-underline",
            "[&_strong]:font-bold",
            "[&_em]:italic",
            "[&_hr]:border-t [&_hr]:border-border [&_hr]:my-4",
            "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4"
          )}
          suppressContentEditableWarning
        />
      </div>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Add optional details for your image
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-caption">Caption (optional)</Label>
              <Input
                id="image-caption"
                placeholder="Image caption"
                value={imageData.caption}
                onChange={(e) => setImageData({ ...imageData, caption: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                placeholder="Describe the image"
                value={imageData.alt}
                onChange={(e) => setImageData({ ...imageData, alt: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="image-description">Description (for accessibility)</Label>
              <Textarea
                id="image-description"
                placeholder="Detailed description for screen readers"
                value={imageData.description}
                onChange={(e) => setImageData({ ...imageData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInsertImage}>Insert Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Add a link to your content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkData.url}
                onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertLink();
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="link-newtab"
                checked={linkData.openInNewTab}
                onCheckedChange={(checked) => 
                  setLinkData({ ...linkData, openInNewTab: checked as boolean })
                }
              />
              <Label htmlFor="link-newtab" className="cursor-pointer">
                Open in new tab
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInsertLink}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RichTextEditor;
