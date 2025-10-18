import { useEffect, useRef, useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Heading1, Heading2, Heading3, List, Quote, Link } from "lucide-react";
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
  const formatTimeoutRef = useRef<NodeJS.Timeout>();

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

  const applyFormattingDebounced = useCallback(() => {
    if (formatTimeoutRef.current) {
      clearTimeout(formatTimeoutRef.current);
    }

    formatTimeoutRef.current = setTimeout(() => {
      if (!editorRef.current || isUpdatingFromProps.current) return;
      
      const text = editorRef.current.innerText || '';
      const selection = window.getSelection();
      const cursorOffset = selection?.focusOffset || 0;
      const focusNode = selection?.focusNode;
      
      isUpdatingFromProps.current = true;
      editorRef.current.innerHTML = formatContent(text);
      isUpdatingFromProps.current = false;
      
      // Try to restore cursor
      if (selection && focusNode) {
        try {
          const range = document.createRange();
          const textNodes: Text[] = [];
          
          const getTextNodes = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              textNodes.push(node as Text);
            } else {
              node.childNodes.forEach(getTextNodes);
            }
          };
          
          if (editorRef.current) {
            getTextNodes(editorRef.current);
            if (textNodes.length > 0) {
              const lastNode = textNodes[textNodes.length - 1];
              range.setStart(lastNode, Math.min(cursorOffset, lastNode.length));
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        } catch (e) {
          // Cursor restoration failed, not critical
        }
      }
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (formatTimeoutRef.current) {
        clearTimeout(formatTimeoutRef.current);
      }
    };
  }, []);

  const insertFormatting = (before: string, after: string = '') => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    const formattedText = before + selectedText + after;
    range.deleteContents();
    
    const textNode = document.createTextNode(formattedText);
    range.insertNode(textNode);
    
    // Move cursor after inserted text
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Trigger input event
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
  };

  const handleFormat = (format: string) => {
    switch (format) {
      case 'bold':
        insertFormatting('**', '**');
        break;
      case 'italic':
        insertFormatting('*', '*');
        break;
      case 'h1':
        insertFormatting('# ', '\n');
        break;
      case 'h2':
        insertFormatting('## ', '\n');
        break;
      case 'h3':
        insertFormatting('### ', '\n');
        break;
      case 'list':
        insertFormatting('- ', '\n');
        break;
      case 'quote':
        insertFormatting('> ', '\n');
        break;
      case 'link':
        insertFormatting('[', '](url)');
        break;
    }
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
    
    // Only set content if editor is empty and we have initial value
    const currentText = editorRef.current.innerText || '';
    if (!currentText && value) {
      isUpdatingFromProps.current = true;
      editorRef.current.innerHTML = formatContent(value);
      setIsEmpty(false);
      isUpdatingFromProps.current = false;
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current || isUpdatingFromProps.current) return;
    
    const text = editorRef.current.innerText || '';
    setIsEmpty(text.trim().length === 0);
    onChange(text);
    
    applyFormattingDebounced();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const br = document.createElement('br');
      range.insertNode(br);
      
      // Insert a second br if at the end of the content to ensure the cursor moves down
      const afterBr = document.createElement('br');
      range.insertNode(afterBr);
      
      // Move cursor after the line break
      range.setStartAfter(br);
      range.setEndAfter(br);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Trigger input event
      if (editorRef.current) {
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
      }
    }
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
      
      <div className="flex items-center gap-1 p-2 border border-input rounded-t-md bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('bold')}
          title="Bold (** **)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
          title="Italic (* *)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('h1')}
          title="Heading 1 (#)"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('h2')}
          title="Heading 2 (##)"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('h3')}
          title="Heading 3 (###)"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('list')}
          title="List (- )"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('quote')}
          title="Quote (> )"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('link')}
          title="Link ([text](url))"
        >
          <Link className="h-4 w-4" />
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
          onKeyDown={handleKeyDown}
          onSelect={handleSelection}
          onPaste={handlePaste}
          className={cn(
            "min-h-[400px] w-full rounded-b-md border border-t-0 border-input bg-background px-4 py-3",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "prose prose-slate max-w-none [&>*:first-child]:mt-0"
          )}
          suppressContentEditableWarning
        >
          {!value && <br />}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
