import { type Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Minus,
  Image,
  Type,
  Table as TableIcon,
  Video,
  Sparkles,
  Share2,
  Undo2,
  Redo2,
  Code,
  RemoveFormatting,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface TipTapToolbarProps {
  editor: Editor | null;
  onOpenImageDialog: () => void;
  onOpenLinkDialog: () => void;
  onOpenTableDialog: () => void;
  onOpenYouTubeDialog: () => void;
  onOpenPromptDialog: () => void;
  onOpenSocialDialog: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}

const ToolbarButton = ({ onClick, isActive, disabled, icon, label, shortcut }: ToolbarButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'h-8 w-8 p-0',
          isActive && 'bg-muted text-primary'
        )}
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs">
      {label}
      {shortcut && <span className="ml-2 text-muted-foreground">{shortcut}</span>}
    </TooltipContent>
  </Tooltip>
);

const TipTapToolbar = ({
  editor,
  onOpenImageDialog,
  onOpenLinkDialog,
  onOpenTableDialog,
  onOpenYouTubeDialog,
  onOpenPromptDialog,
  onOpenSocialDialog,
}: TipTapToolbarProps) => {
  if (!editor) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="sticky top-20 z-40 flex items-center gap-0.5 p-2 border border-input rounded-t-md bg-background flex-wrap shadow-sm">
        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={<Undo2 className="h-4 w-4" />}
          label="Undo"
          shortcut="Ctrl+Z"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={<Redo2 className="h-4 w-4" />}
          label="Redo"
          shortcut="Ctrl+Shift+Z"
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={<Bold className="h-4 w-4" />}
          label="Bold"
          shortcut="Ctrl+B"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={<Italic className="h-4 w-4" />}
          label="Italic"
          shortcut="Ctrl+I"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={<Strikethrough className="h-4 w-4" />}
          label="Strikethrough"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          icon={<Code className="h-4 w-4" />}
          label="Inline Code"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          icon={<RemoveFormatting className="h-4 w-4" />}
          label="Clear Formatting"
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={<Heading1 className="h-4 w-4" />}
          label="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 className="h-4 w-4" />}
          label="Heading 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={<Heading3 className="h-4 w-4" />}
          label="Heading 3"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph') && !editor.isActive('heading')}
          icon={<Type className="h-4 w-4" />}
          label="Paragraph"
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists & blocks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={<List className="h-4 w-4" />}
          label="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={<ListOrdered className="h-4 w-4" />}
          label="Numbered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={<Quote className="h-4 w-4" />}
          label="Block Quote"
        />

        {/* Link */}
        <ToolbarButton
          onClick={onOpenLinkDialog}
          isActive={editor.isActive('link')}
          icon={<LinkIcon className="h-4 w-4" />}
          label="Insert Link"
          shortcut="Ctrl+K"
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Inserts */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={<Minus className="h-4 w-4" />}
          label="Horizontal Rule"
        />
        <ToolbarButton
          onClick={onOpenImageDialog}
          icon={<Image className="h-4 w-4" />}
          label="Insert Image"
        />
        <ToolbarButton
          onClick={onOpenTableDialog}
          icon={<TableIcon className="h-4 w-4" />}
          label="Insert Table"
        />
        <ToolbarButton
          onClick={onOpenYouTubeDialog}
          icon={<Video className="h-4 w-4" />}
          label="YouTube Video"
        />
        <ToolbarButton
          onClick={onOpenPromptDialog}
          icon={<Sparkles className="h-4 w-4 text-emerald-500" />}
          label="Insert Prompt Box"
        />
        <ToolbarButton
          onClick={onOpenSocialDialog}
          icon={<Share2 className="h-4 w-4" />}
          label="Embed Social Media"
        />
      </div>
    </TooltipProvider>
  );
};

export default TipTapToolbar;
