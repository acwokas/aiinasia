import { useState, Dispatch, SetStateAction } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Image Dialog
interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageData: { url: string; caption: string; alt: string; description: string; size: string; filename: string };
  setImageData: Dispatch<SetStateAction<{ url: string; caption: string; alt: string; description: string; size: 'large' | 'medium' | 'small'; filename: string }>>;
  pendingImageFile: File | null;
  onInsert: () => void;
  onImageInputClick: () => void;
  onRemoveImage: () => void;
  isUploading: boolean;
}

export function ImageDialog({ open, onOpenChange, imageData, setImageData, onInsert, onImageInputClick, onRemoveImage, isUploading }: ImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Insert Image</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Image URL</Label><Input value={imageData.url} onChange={e => setImageData(prev => ({ ...prev, url: e.target.value }))} placeholder="https://..." /></div>
          <div><Label>Alt Text</Label><Input value={imageData.alt} onChange={e => setImageData(prev => ({ ...prev, alt: e.target.value }))} /></div>
          <div><Label>Caption</Label><Input value={imageData.caption} onChange={e => setImageData(prev => ({ ...prev, caption: e.target.value }))} /></div>
          <Button variant="outline" onClick={onImageInputClick} disabled={isUploading}>Upload Image</Button>
          {imageData.url && <Button variant="ghost" onClick={onRemoveImage}>Remove</Button>}
        </div>
        <DialogFooter><Button onClick={onInsert} disabled={!imageData.url || isUploading}>{isUploading ? 'Uploading...' : 'Insert'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Link Dialog
interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkData: { url: string; text: string; openInNewTab: boolean };
  setLinkData: Dispatch<SetStateAction<{ url: string; text: string; openInNewTab: boolean }>>;
  isEditingLink: boolean;
  onInsert: () => void;
  onRemove: () => void;
}

export function LinkDialog({ open, onOpenChange, linkData, setLinkData, isEditingLink, onInsert, onRemove }: LinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEditingLink ? 'Edit Link' : 'Insert Link'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>URL</Label><Input value={linkData.url} onChange={e => setLinkData(prev => ({ ...prev, url: e.target.value }))} placeholder="https://..." /></div>
          <div><Label>Text</Label><Input value={linkData.text} onChange={e => setLinkData(prev => ({ ...prev, text: e.target.value }))} /></div>
          <div className="flex items-center gap-2">
            <Checkbox checked={linkData.openInNewTab} onCheckedChange={c => setLinkData(prev => ({ ...prev, openInNewTab: !!c }))} />
            <Label>Open in new tab</Label>
          </div>
        </div>
        <DialogFooter>
          {isEditingLink && <Button variant="destructive" onClick={onRemove}>Remove Link</Button>}
          <Button onClick={onInsert}>{isEditingLink ? 'Update' : 'Insert'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Table Dialog
interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableData: { rows: number; columns: number; hasHeader: boolean };
  setTableData: Dispatch<SetStateAction<{ rows: number; columns: number; hasHeader: boolean }>>;
  onInsert: () => void;
}

export function TableDialog({ open, onOpenChange, tableData, setTableData, onInsert }: TableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Insert Table</DialogTitle></DialogHeader>
        <div className="flex gap-3">
          <div><Label>Rows</Label><Input type="number" value={tableData.rows} onChange={e => setTableData(prev => ({ ...prev, rows: parseInt(e.target.value) || 3 }))} /></div>
          <div><Label>Columns</Label><Input type="number" value={tableData.columns} onChange={e => setTableData(prev => ({ ...prev, columns: parseInt(e.target.value) || 3 }))} /></div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox checked={tableData.hasHeader} onCheckedChange={c => setTableData(prev => ({ ...prev, hasHeader: !!c }))} />
          <Label>Include header row</Label>
        </div>
        <DialogFooter><Button onClick={onInsert}>Insert</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// YouTube Dialog
interface YouTubeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  youtubeUrl: string;
  setYoutubeUrl: Dispatch<SetStateAction<string>>;
  onInsert: () => void;
}

export function YouTubeDialog({ open, onOpenChange, youtubeUrl, setYoutubeUrl, onInsert }: YouTubeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Embed YouTube Video</DialogTitle></DialogHeader>
        <div><Label>YouTube URL</Label><Input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
        <DialogFooter><Button onClick={onInsert}>Embed</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Prompt Dialog
interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptData: { title: string; content: string };
  setPromptData: Dispatch<SetStateAction<{ title: string; content: string }>>;
  onInsert: () => void;
}

export function PromptDialog({ open, onOpenChange, promptData, setPromptData, onInsert }: PromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Insert Prompt Box</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={promptData.title} onChange={e => setPromptData(prev => ({ ...prev, title: e.target.value }))} /></div>
          <div><Label>Content</Label><Input value={promptData.content} onChange={e => setPromptData(prev => ({ ...prev, content: e.target.value }))} /></div>
        </div>
        <DialogFooter><Button onClick={onInsert}>Insert</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Social Embed Dialog
interface SocialEmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedCode: string;
  setEmbedCode: Dispatch<SetStateAction<string>>;
  onInsert: () => void;
}

export function SocialEmbedDialog({ open, onOpenChange, embedCode, setEmbedCode, onInsert }: SocialEmbedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Embed Social Post</DialogTitle></DialogHeader>
        <div><Label>Embed Code or URL</Label><Input value={embedCode} onChange={e => setEmbedCode(e.target.value)} placeholder="Paste embed code or URL..." /></div>
        <DialogFooter><Button onClick={onInsert}>Embed</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
