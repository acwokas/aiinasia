import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Heading1, Heading2, Heading3, List, Quote, Link as LinkIcon, Minus, Image, Type } from "lucide-react";
import { cn } from "@/lib/utils";

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
        const url = prompt('Enter URL:');
        if (url) {
          const openInNewTab = confirm('Open link in new tab?');
          execCommand('createLink', url);
          
          // Add target="_blank" if user wants to open in new tab
          if (openInNewTab) {
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
        }
        break;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      execCommand('insertImage', imageUrl);
    };
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again
    e.target.value = '';
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
      
      <div className="flex items-center gap-1 p-2 border border-input rounded-t-md bg-muted/30 flex-wrap">
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
    </div>
  );
};

export default RichTextEditor;
