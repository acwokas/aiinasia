import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
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
  const isUpdatingFromProps = useRef(false);
  const [isEmpty, setIsEmpty] = useState(!value);

  const formatContent = (text: string) => {
    if (!text) return '';
    
    let formatted = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/(<li.*?<\/li>\s*)+/gs, '<ul class="list-disc space-y-1 my-4">$&</ul>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">$1</blockquote>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
    
    return `<p class="mb-4">${formatted}</p>`.replace(/<p class="mb-4"><\/p>/g, '');
  };

  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return null;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  };

  const restoreCursorPosition = (position: number) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    const range = document.createRange();
    
    let currentPos = 0;
    const walk = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length || 0;
        if (currentPos + textLength >= position) {
          range.setStart(node, position - currentPos);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
          return true;
        }
        currentPos += textLength;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (walk(node.childNodes[i])) return true;
        }
      }
      return false;
    };

    walk(editorRef.current);
  };

  const stripHtmlToMarkdown = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    let markdown = temp.innerHTML
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gs, '$1\n')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/g, '> $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return markdown;
  };

  useEffect(() => {
    if (!editorRef.current || isUpdatingFromProps.current) return;
    
    const currentMarkdown = stripHtmlToMarkdown(editorRef.current.innerHTML);
    if (currentMarkdown !== value) {
      isUpdatingFromProps.current = true;
      editorRef.current.innerHTML = formatContent(value);
      isUpdatingFromProps.current = false;
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current || isUpdatingFromProps.current) return;
    
    const text = editorRef.current.innerText || '';
    setIsEmpty(text.trim().length === 0);
    
    const cursorPos = saveCursorPosition();
    const markdown = stripHtmlToMarkdown(editorRef.current.innerHTML);
    
    isUpdatingFromProps.current = true;
    editorRef.current.innerHTML = formatContent(markdown);
    isUpdatingFromProps.current = false;
    
    if (cursorPos !== null) {
      restoreCursorPosition(cursorPos);
    }
    
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
      <div className="relative">
        {isEmpty && (
          <div className="absolute top-3 left-4 text-muted-foreground pointer-events-none">
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
            "min-h-[400px] w-full rounded-md border border-input bg-background px-4 py-3",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "prose prose-slate max-w-none"
          )}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: formatContent(value) }}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
